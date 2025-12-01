# Qiskit Studio Helm Chart

Qiskit Studio is an application designed to provide an interactive environment for quantum computing development, leveraging AI agents for code generation and analysis. This Helm chart deploys the Qiskit Studio application, which includes a frontend, an API service, a code generation service, and a code execution service.

**Note on Compatibility:** This chart has been primarily tested for local installation on:
*   **macOS:**
    *   Using [Colima](https://github.com/abiosoft/colima) with [Kind](https://kind.sigs.k8s.io/).
    *   Using [Rancher Desktop](https://rancherdesktop.io/).
    *   Using [Podman Desktop](https://podman-desktop.io/) (Note: NodePort services do not currently work on Podman Desktop on macOS due to [this known issue](https://github.com/podman-desktop/podman-desktop/issues/13564)).
*   **Linux (Fedora):** Using Podman and [Kind](https://kind.sigs.k8s.io/) clusters.

The `charts/qiskit-studio/values-local.yaml` file is pre-configured to provide a seamless local development experience across these platforms.

## Building Container Images

Before deploying with Helm, you need to build the container images locally. The chart uses local image names that match the build commands in the API documentation.

### Build All Images

From the repository root:

```bash
# Build frontend
docker build -t qiskit-studio-ui:latest .

# Build chat agent
cd api/chat-agent/
docker build -t chat-agent:latest .
cd ../..

# Build codegen agent
cd api/codegen-agent/
docker build -t codegen-agent:latest .
cd ../..

# Build coderun agent
cd api/coderun-agent/
docker build -t coderun-agent:latest .
cd ../..
```

### Load Images into Kind

If using Kind for local Kubernetes:

```bash
kind load docker-image qiskit-studio-ui:latest
kind load docker-image chat-agent:latest
kind load docker-image codegen-agent:latest
kind load docker-image coderun-agent:latest
```

**Note:** The Milvus image (`milvusdb/milvus:v2.6.1`) and other public images will be pulled automatically from their respective registries.

## Quick Start

**Recommendation:** For local development, using [Colima](https://github.com/abiosoft/colima) with [Kind](https://kind.sigs.k8s.io/) is highly recommended for its robust and consistent behavior across platforms. Refer to the "Note on Compatibility" section for detailed setup instructions and other supported environments.

This guide is for a local installation on macOS (arm) with Ollama available on port 11434.

### Image Pull Secrets for ICR

If you are pulling images from a private registry (e.g., `icr.io`), you can pass your IBM Cloud API key directly at install time and the chart will auto-create (or re-use) a Kubernetes docker-registry Secret for you.

Simplest path (recommended for local):

1) Get an IBM Cloud API key

```bash
# Login (SSO is typical for IBM internal accounts)
ibmcloud login --sso

# Create an API key and capture just the key (requires jq)
ICR_KEY=$(ibmcloud iam api-key-create qiskit-studio-local -d "Qiskit Studio local" -o json | jq -r '.apikey')

# If you don't have jq, run the same command without -o json and copy the apikey value manually:
# ibmcloud iam api-key-create qiskit-studio-local -d "Qiskit Studio local"
# export ICR_KEY="<paste the apikey you were shown>"
```

### Install

To install the chart with defaults and the auto ICR pull-secret creation in one step, use the `icrKey` flag from the section above.

Minimal local install:

```bash
helm install qiskit-studio-local charts/qiskit-studio \
  -f charts/qiskit-studio/values-local.yaml \
  --set-string icrKey="$ICR_KEY"
```

**IMPORTANT:** The application pods may take a few minutes to start up, especially on the first installation as the knowledge base is preloaded with documentation.

You can monitor the status of all pods by running the following command:

```bash
kubectl get pods -l app.kubernetes.io/instance=qiskit-studio-local --watch
```

Once all pods are in the 'Running' or 'Completed' state, you can proceed to the next steps.

*Note: Drop the `--set` argument if you don't need the extra secret.*

### Test backend services (optional)

```bash
helm test qiskit-studio-local
# The helm test may take ~1 minute

# Look at logs for the 'validator' container
kubectl logs -l app.kubernetes.io/component=test
```

### Accessing UI

Go to http://127.0.0.1:30000

### Uninstall

```bash
helm uninstall qiskit-studio-local
```

---

## Deployment Scenarios

### OpenShift Deployment with Routes

For OpenShift clusters, the chart supports native OpenShift Routes instead of Kubernetes Ingress. Routes provide automatic TLS termination and integrate with OpenShift's built-in router.

**Example: Deploying to Research@IBM OpenShift cluster**

```bash
helm install qiskit-studio charts/qiskit-studio \
  -n qiskitstudio \
  -f charts/qiskit-studio/values-openshift-research.yaml
```

This configuration:
- Enables OpenShift Routes (`route.enabled: true`)
- Disables Kubernetes Ingress
- Creates routes with automatic hostname generation: `<service>.<release-name>.<namespace>.<domain>`
- Configures edge TLS termination with automatic certificates
- Sets appropriate resource limits for OpenShift LimitRange policies

**Accessing the application:**
- Frontend: `https://qiskit-studio.qiskitstudio.apps.example.com`
- Chat API: `https://chat.qiskit-studio.qiskitstudio.apps.example.com`
- Codegen API: `https://codegen.qiskit-studio.qiskitstudio.apps.example.com`
- Coderun API: `https://coderun.qiskit-studio.qiskitstudio.apps.example.com`

**Custom route hostname:**

To use a custom hostname instead of the auto-generated one:

```yaml
route:
  enabled: true
  type: "openshift"
  domain: "apps.example.com"
  host: "my-custom-hostname.apps.example.com"  # Optional: override auto-generated hostname
```

### Local Deployment (Default)

The Quick Start guide above uses the `values-local.yaml` file, which is the recommended method for local development. This configuration disables Ingress and exposes services via `NodePort` for easy access on your local machine.

### Local Deployment on Linux with Kind

For users on Linux, a `kind` cluster can be configured to expose NodePorts directly to the host. This allows for a similar local development experience as on macOS.

Create a kind cluster:

```sh
cat <<EOF | kind create cluster --config=-
# A recommended kind configuration for local development
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  # The control-plane node, which will also handle ingress and nodeport traffic
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  # Mappings for an Ingress controller (if enabled)
  - containerPort: 80
    hostPort: 8080
    protocol: TCP
  - containerPort: 443
    hostPort: 8443
    protocol: TCP
  # --- Added for NodePorts ---
  - containerPort: 30000
    hostPort: 30000
    protocol: TCP
  - containerPort: 30001
    hostPort: 30001
    protocol: TCP
  - containerPort: 30002
    hostPort: 30002
    protocol: TCP
  - containerPort: 30003
    hostPort: 30003
    protocol: TCP
- role: worker
- role: worker
EOF
```

The `extraPortMappings` section ensures that the specified NodePorts (30000, 30001, 30002) are directly mapped from the Kind cluster's control-plane node to your Linux host, allowing you to access them via `localhost` or your machine's IP address.

**Note on LLM Hostname for Linux:**
When configuring the LLM `baseUrl` in `values-local.yaml`, `host.docker.internal` is used by default. This hostname is primarily supported by Docker Desktop on macOS and Windows. On Linux, you might need to:

* **Use `--add-host host.docker.internal:host-gateway`** when running your Docker/Podman container to map `host.docker.internal` to your host's IP.
* **Replace `host.docker.internal` with your host machine's actual IP address** in `values-local.yaml` if you are not using the `--add-host` flag.

## Configuration

The following sections detail the configurable parameters of the Qiskit Studio chart.

### Commonly Modified Parameters

This table lists the parameters that you are most likely to configure for both local and cloud deployments. These settings control essential aspects like service endpoints, LLM connections, and container images.

| Parameter | Description | Default |
|---|---|---|
| `global.hostname` | The hostname for the application (used for local deployments). | `"localhost"` |
| `global.llm.chat.baseUrl` | The base URL for the LLM service. | `""` |
| `global.llm.chat.model` | The LLM model to use for chat and code generation. | `"granite3.3:8b"` |
| `global.llm.chat.secret.value` | The value for the LLM API key. Required if `secret.create` is `true`. | `""` |
| `global.llm.initChecks.enabled` | Whether to enable init container checks for LLM connectivity. | `true` |
| `global.llm.embedding.baseUrl` | The base URL for the custom embedding service. Service will append /embeddings | `""` |
| `global.llm.embedding.secret.value` | The value for the Embedding LLM API key. Required if `secret.create` is `true`. | `""` |
| `frontend.image.repository` | The frontend image repository. | `qiskit-studio-ui` |
| `frontend.image.tag` | The frontend image tag. | `v0.0.3` |
| `chat.image.repository` | The chat image repository. | `ghcr.io/ai4quantum/maestro` |
| `chat.image.tag` | The chat image tag. | `0.5.0` |
| `codegen.image.repository` | The codegen image repository. | `ghcr.io/ai4quantum/maestro` |
| `codegen.image.tag` | The codegen image tag. | `0.5.0` |
| `coderun.image.repository` | The coderun image repository. | `coderun-agent` |
| `coderun.image.tag` | The coderun image tag. | `v0.0.3` |
| `route.enabled` | Whether to enable OpenShift Routes. | `false` |
| `route.type` | Route type (`openshift` for OpenShift Routes). | `"openshift"` |
| `route.host` | Custom route hostname (leave empty for auto-generated). | `""` |
| `route.timeout` | HAProxy timeout for routes. | `"120s"` |
| `ingress.enabled` | Whether to enable Kubernetes Ingress. | `false` |
| `ingress.host` | The ingress host. (Configured in `values-cloud.yaml`) | `agents.experimental.quantum.ibm.com` |
| `extraEnvVars` | A list of additional environment variables to be added to all pods. | `[]` |

#### Milvus Security Context

By default, this chart deploys Milvus with a restrictive security context, which is compatible with modern Kubernetes platforms that enforce Pod Security Standards (such as OpenShift).

If you are deploying on an older or less restrictive platform and find that the Milvus pod fails to start due to permission errors, you may need to apply the `Unconfined` seccomp profile. You can do this by adding the following to your custom values file:

```yaml
milvus:
  securityContext:
    seccompProfile:
      type: Unconfined
```

<details>
<summary>Detailed Configuration</summary>

The following table lists all configurable parameters of the Qiskit Studio chart and their default values.

| Parameter | Description | Default |
|---|---|---|
| `global.scheme` | The URL scheme (`http` or `https`). | `"http"` |
| `global.additionalCORSOrigins` | A list of additional origins to allow for CORS (e.g., `["http://192.168.1.100:30000"]`). | `[]` |
| `global.llm.chat.secret.create` | Whether to create a new secret for the LLM API key. | `true` |
| `global.llm.chat.secret.name` | The name of the secret to create or use. If not set, a name is generated. | `""` |
| `global.llm.chat.secret.key` | The key in the secret that holds the API key. | `"apiKey"` |
| `global.llm.embedding.model` | The model name for the custom embedding service. | `"nomic-embed-text"` |
| `global.llm.embedding.vectorSize` | The vector size for the custom embedding service. | `"768"` |
| `global.llm.initChecks.enabled` | Whether to enable init container checks for LLM connectivity. | `true` |
| `global.llm.embedding.secret.create` | Whether to create a new secret for the Embedding LLM API key. | `true` |
| `global.llm.embedding.secret.name` | The name of the secret to create or use for the Embedding LLM. If not set, a name is generated. | `""` |
| `global.llm.embedding.secret.key` | The key in the secret that holds the Embedding LLM API key. | `"apiKey"` |
| `global.imagePullSecrets` | A list of image pull secrets to be used for all deployments. | `[]` |
| `global.extraEnvVars` | A list of additional environment variables to be added to all pods. | `[]` |
| `frontend.replicaCount` | The number of frontend replicas. | `1` |
| `frontend.image.pullPolicy` | The frontend image pull policy. | `IfNotPresent` |
| `frontend.service.type` | The frontend service type. | `ClusterIP` |
| `frontend.service.port` | The frontend service port. | `3000` |
| `frontend.resources` | The resources for the frontend pod. | `requests: { cpu: "100m", memory: "128Mi" }, limits: { cpu: "200m", memory: "256Mi" }` |
| `frontend.extraEnvVars` | A list of additional environment variables to be added to the frontend pod. | `[]` |
| `chat.replicaCount` | The number of chat replicas. | `1` |
| `chat.image.pullPolicy` | The chat image pull policy. | `IfNotPresent` |
| `chat.service.type` | The chat service type. | `ClusterIP` |
| `chat.service.port` | The chat service port. | `8000` |
| `chat.service.nodePort` | The nodePort for the chat service. | `null` |
| `chat.resources` | The resources for the chat pod. | `requests: { cpu: "250m", memory: "512Mi" }, limits: { cpu: "500m", memory: "1Gi" }` |
| `chat.extraEnvVars` | A list of additional environment variables to be added to the chat pod. | `[]` |
| `codegen.replicaCount` | The number of codegen replicas. | `1` |
| `codegen.image.pullPolicy` | The codegen image pull policy. | `IfNotPresent` |
| `codegen.service.type` | The codegen service type. | `ClusterIP` |
| `codegen.service.port` | The codegen service port. | `8000` |
| `codegen.service.nodePort` | The nodePort for the codegen service. | `null` |
| `codegen.resources` | The resources for the codegen pod. | `requests: { cpu: "250m", memory: "512Mi" }, limits: { cpu: "500m", memory: "1Gi" }` |
| `codegen.extraEnvVars` | A list of additional environment variables to be added to the codegen pod. | `[]` |
| `knowledgeMcp.replicaCount` | The number of knowledge MCP replicas. | `1` |
| `knowledgeMcp.image.repository` | The knowledge MCP image repository. | `ghcr.io/ai4quantum/maestro-knowledge` |
| `knowledgeMcp.image.tag` | The knowledge MCP image tag. | `0.6.0` |
| `knowledgeMcp.image.pullPolicy` | The knowledge MCP image pull policy. | `IfNotPresent` |
| `knowledgeMcp.service.type` | The knowledge MCP service type. | `ClusterIP` |
| `knowledgeMcp.service.port` | The knowledge MCP service port. | `8030` |
| `knowledgeMcp.resources` | The resources for the knowledgeMcp pod. | `requests: { cpu: "250m", memory: "512Mi" }, limits: { cpu: "500m", memory: "1Gi" }` |
| `knowledgeMcp.readinessProbe.initialDelaySeconds` | Initial delay for knowledge MCP readiness probe. | `210` |
| `knowledgeMcp.readinessProbe.periodSeconds` | Period for knowledge MCP readiness probe. | `10` |
| `knowledgeMcp.readinessProbe.failureThreshold` | Failure threshold for knowledge MCP readiness probe. | `15` |
| `knowledgeMcp.livenessProbe.initialDelaySeconds` | Initial delay for knowledge MCP liveness probe. | `210` |
| `knowledgeMcp.livenessProbe.periodSeconds` | Period for knowledge MCP liveness probe. | `10` |
| `knowledgeMcp.livenessProbe.failureThreshold` | Failure threshold for knowledge MCP liveness probe. | `15` |
| `knowledgeMcp.extraEnvVars` | A list of additional environment variables to be added to the knowledgeMcp pod. | `[]` |
| `coderun.replicaCount` | The number of coderun replicas. | `1` |
| `coderun.image.pullPolicy` | The coderun image pull policy. | `IfNotPresent` |
| `coderun.service.type` | The coderun service type. | `ClusterIP` |
| `coderun.service.port` | The coderun service port. | `8000` |
| `coderun.service.nodePort` | The nodePort for the coderun service. | `null` |
| `coderun.resources` | The resources for the coderun pod. | `requests: { cpu: "100m", memory: "128Mi" }, limits: { cpu: "200m", memory: "256Mi" }` |
| `coderun.extraEnvVars` | A list of additional environment variables to be added to the coderun pod. | `[]` |
| `milvus.image.repository` | The Milvus image repository. | `milvusdb/milvus` |
| `milvus.image.tag` | The Milvus image tag. | `v2.6.1` |
| `milvus.image.pullPolicy` | The Milvus image pull policy. | `IfNotPresent` |
| `milvus.pvc.storage` | The storage request for the Milvus PVC.. | `4Gi` |
| `milvus.service.type` | The Milvus service type. | `ClusterIP` |
| `milvus.service.grpcPort` | The Milvus gRPC port. | `19530` |
| `milvus.service.httpPort` | The Milvus HTTP port. | `9091` |
| `milvus.extraEnvVars` | A list of additional environment variables to be added to the milvus pod. | `[]` |
| `knowledgePreloaderJob.enabled` | Whether to enable the knowledge preloader job. | `true` |
| `knowledgePreloaderJob.image.repository` | The knowledge preloader job image repository. | `registry.access.redhat.com/ubi9/python-312-minimal` |
| `knowledgePreloaderJob.image.tag` | The knowledge preloader job image tag. | `9.6-1755762229` |
| `knowledgePreloaderJob.image.pullPolicy` | The knowledge preloader job image pull policy. | `IfNotPresent` |
| `knowledgePreloaderJob.ttlSecondsAfterFinished` | Time in seconds to keep the job logs after completion. | `3600` |
| `knowledgePreloaderJob.backoffLimit` | The number of retries before marking the job as failed. | `4` |
| `knowledgePreloaderJob.resources` | The resources for the knowledge preloader job pod. | `requests: { memory: "1Gi", cpu: "500m" }, limits: { memory: "2Gi", cpu: "1" }` |
| `knowledgePreloaderJob.extraEnvVars` | A list of additional environment variables to be added to the knowledge preloader job pod. | `[]` |
| `knowledgePreloaderJob.documentUrls` | A list of URLs to preload into the knowledge base. | `["https://quantum.cloud.ibm.com/docs/en/tutorials/chsh-inequality", ...]` |
| `maestro.logLevel` | The log level for Maestro. | `INFO` |
| `ingress.className` | The ingress class name. | `""` |
| `ingress.annotations` | Ingress annotations. | `{}` |
| `ingress.tls.enabled` | Whether to enable TLS. | `false` |
| `ingress.tls.secretName` | The name of the secret containing the TLS certificate. (Configured in `values-cloud.yaml`) | `""` |
| `test.enabled` | Whether to enable the test pod. | `true` |
| `test.image.repository` | The test image repository. | `curlimages/curl` |
| `test.image.tag` | The test image tag. | `latest` |
| `test.image.pullPolicy` | The test image pull policy. | `IfNotPresent` |
| `test.timeout` | The timeout for the test. | `120s` |
| `test.extraEnvVars` | A list of additional environment variables to be added to the test pod. | `[]` |

</details>

### LLM API Key Secret Management

For local deployments using `values-local.yaml`, the LLM secrets are automatically created with dummy values, simplifying the setup process.

For other deployments, by default, this chart assumes your LLM API key secrets are pre-existing in your Kubernetes cluster and will not create them. This global LLM configuration applies to all services.

**To use pre-existing LLM secrets:**

Ensure your secrets are created in your cluster before installing the chart.

**Example: Manually creating LLM API key secrets:**

* **For chat LLM (e.g., `vllm-api-key-secret`):**

```bash
kubectl create secret generic vllm-api-key-secret --from-literal=api_key=$VLLM_API_KEY
```

* **For embedding LLM (e.g., `local-llm-secret`):**

```bash
kubectl create secret generic local-llm-secret --from-literal=apiKey=dummy
```

**Alternatively, to have Helm create the LLM secrets for you:**

You can pass the secret values during `helm install` by setting `create: true` for the respective secret.

**Example: Creating chat LLM secret via Helm:**

```bash
helm install my-release . --set global.llm.chat.secret.create=true --set global.llm.chat.secret.value=YOUR_CHAT_API_KEY
```

**Example: Creating both chat and embedding LLM secrets via Helm:**

```bash
helm install my-release . --set global.llm.chat.secret.create=true --set global.llm.chat.secret.value=YOUR_CHAT_API_KEY --set global.llm.embedding.secret.create=true --set global.llm.embedding.secret.value=YOUR_EMBEDDING_API_KEY
```

**Note:** If `global.llm.chat.secret.name` and `global.llm.embedding.secret.name` are set to the same value, and both are set to `create: true`, only one Kubernetes Secret will be created, and it will contain the API key(s) provided.

### Image Pull Secrets

If you are pulling images from a private registry (e.g., `icr.io`), prefer the simple install-time key flag:

```bash
helm install <release> charts/qiskit-studio \
  -f charts/qiskit-studio/values-local.yaml \
  --set-string icrKey="$ICR_KEY"
```

This will:

* Create (or re-use) a docker-registry Secret for `icr.io`
* Default the name to `<release>-icrkey` unless you set `global.imagePullSecrets.name`
* Wire all workloads’ `imagePullSecrets` to that Secret

Detailed options and precedence:

* Flags accepted for the key: `icrKey` or `icrkey`
* Precedence for the “effective key”: `global.imagePullSecrets.value` > `icrKey/icrkey`
* Secret name resolution: `global.imagePullSecrets.name` if set; otherwise `<fullname>-icrkey`
* Legacy path: if `global.imagePullSecrets.create=true` is set, the legacy template is used and the new auto-secret is skipped

Manual/advanced (if you need it):

* Create the Secret yourself and pass only its name via `global.imagePullSecrets.name`.
* Or log in with Podman/Docker and use `kubectl create secret docker-registry ...` to provide the `.dockerconfigjson` explicitly.

### Troubleshooting (icrKey install-time key)

* The Secret isn’t created: ensure you passed `--set-string icrKey="$ICR_KEY"` (or `icrkey=...`) and that images are hosted on `icr.io`.
* Reusing an existing Secret: if a Secret named `<release>-icrkey` already exists, the chart will reuse it. Set `global.imagePullSecrets.name` to target a different Secret.
* Verify rendering without installing: run `helm template` and confirm the `image-pull-secret.yaml` manifest is present and that Deployments reference `imagePullSecrets`.

### Future Enhancements

This Helm chart provides a solid foundation for deploying Qiskit Studio. As deployments become more sophisticated and production-ready, consider the following areas for future enhancements:

* **Horizontal Pod Autoscaler (HPA):** Implement HPA to automatically scale deployments based on CPU or memory utilization.
* **Pod Disruption Budget (PDB):** Define PDBs for critical services to ensure a minimum number of healthy pods during voluntary disruptions.
* **Network Policies:** Implement Kubernetes Network Policies to control and secure traffic flow between pods and external services.
* **Security Context:** Define security contexts for pods and containers (e.g., `runAsNonRoot`, `readOnlyRootFilesystem`) to enhance security.
