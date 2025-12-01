{{/*
Expand the name of the chart.
*/}}
{{- define "qiskit-studio.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "qiskit-studio.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "qiskit-studio.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "qiskit-studio.labels" -}}
helm.sh/chart: {{ include "qiskit-studio.chart" . }}
{{ include "qiskit-studio.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels
*/}}
{{- define "qiskit-studio.selectorLabels" -}}
app.kubernetes.io/name: {{ include "qiskit-studio.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Return the name of the LLM secret to use.
*/}}
{{- define "qiskit-studio.llmSecretName" -}}
{{- if .Values.global.llm.chat.secret.create -}}
    {{- .Values.global.llm.chat.secret.name | default (printf "%s-llm-secret" .Release.Name) -}}
{{- else -}}
    {{- .Values.global.llm.chat.secret.name -}}
{{- end -}}
{{- end -}}

{{/*
Return the name of the documentation ConfigMap to use.
*/}}
{{- define "qiskit-studio.docsConfigMapName" -}}
{{- printf "%s-docs" .Release.Name -}}
{{- end -}}

{{/*
Return the name of the Scripts ConfigMap to use.
*/}}
{{- define "qiskit-studio.scriptsConfigMapName" -}}
{{- printf "%s-scripts" .Release.Name -}}
{{- end -}}

{{/*
Return the name of the Embedding LLM secret to use.
*/}}
{{- define "qiskit-studio.embeddingLlmSecretName" -}}
{{- if .Values.global.llm.embedding.secret.create -}}
    {{- .Values.global.llm.embedding.secret.name | default (printf "%s-embedding-llm-secret" .Release.Name) -}}
{{- else -}}
    {{- .Values.global.llm.embedding.secret.name -}}
{{- end -}}
{{- end -}}

{{/*
Return the name of the Ingress TLS secret to use.
*/}}
{{- define "qiskit-studio.ingressTlsSecretName" -}}
{{- printf "%s-tls-secret" .Release.Name -}}
{{- end -}}

{{/*
Return the public-facing origin URL(s) for the frontend, including additional CORS origins.
*/}}
{{- define "qiskit-studio.frontend.origin" -}}
{{- $origins := list -}}
{{- if and .Values.route.enabled (eq .Values.route.type "openshift") -}}
    {{- $origins = append $origins (printf "https://%s.%s.%s" .Release.Name .Release.Namespace .Values.route.domain) -}}
{{- else if .Values.ingress.enabled -}}
    {{- $origins = append $origins (printf "%s://%s" .Values.global.scheme .Values.ingress.host) -}}
{{- else -}}
    {{- $origins = append $origins (printf "%s://%s:%d" .Values.global.scheme .Values.global.hostname (int .Values.frontend.service.nodePort)) -}}
    {{- $origins = append $origins (printf "%s://localhost:%d" .Values.global.scheme (int .Values.frontend.service.nodePort)) -}}
{{- end -}}
{{- range .Values.global.additionalCORSOrigins -}}
    {{- $origins = append $origins . -}}
{{- end -}}
{{- join "," $origins -}}
{{- end -}}

{{/*
Return the public-facing origin URL for the chat service.
*/}}
{{- define "qiskit-studio.chat.origin" -}}
{{- if and .Values.route.enabled (eq .Values.route.type "openshift") -}}
{{- printf "https://chat.%s.%s.%s" .Release.Name .Release.Namespace .Values.route.domain -}}
{{- else if .Values.ingress.enabled -}}
{{- printf "%s://%s/chat" .Values.global.scheme .Values.ingress.host -}}
{{- else -}}
{{- printf "%s://%s:%d" .Values.global.scheme .Values.global.hostname (int .Values.chat.service.nodePort) -}}
{{- end -}}
{{- end -}}

{{/*
Return the public-facing origin URL for the codegen service.
*/}}
{{- define "qiskit-studio.codegen.origin" -}}
{{- if and .Values.route.enabled (eq .Values.route.type "openshift") -}}
{{- printf "https://codegen.%s.%s.%s" .Release.Name .Release.Namespace .Values.route.domain -}}
{{- else if .Values.ingress.enabled -}}
{{- printf "%s://%s/codegen" .Values.global.scheme .Values.ingress.host -}}
{{- else -}}
{{- printf "%s://%s:%d" .Values.global.scheme .Values.global.hostname (int .Values.codegen.service.nodePort) -}}
{{- end -}}
{{- end -}}

{{/*
Return the public-facing origin URL for the coderun service.
*/}}
{{- define "qiskit-studio.coderun.origin" -}}
{{- if and .Values.route.enabled (eq .Values.route.type "openshift") -}}
{{- printf "https://coderun.%s.%s.%s" .Release.Name .Release.Namespace .Values.route.domain -}}
{{- else if .Values.ingress.enabled -}}
{{- printf "%s://%s/coderun" .Values.global.scheme .Values.ingress.host -}}
{{- else -}}
{{- printf "%s://%s:%d" .Values.global.scheme .Values.global.hostname (int .Values.coderun.service.nodePort) -}}
{{- end -}}
{{- end -}}

{{/*
Compile all extraEnvVars from global and specific contexts.
*/}}
{{- define "qiskit-studio.extraEnvVars" -}}
{{- $global := .Values.extraEnvVars -}}
{{- $local := .extraEnvVars | default list -}}
{{- $envVars := concat $global $local -}}
{{- if $envVars -}}
{{ toYaml $envVars }}
{{- end -}}
{{- end -}}

{{/*
Resolve the effective image pull secret API key for IBM Container Registry (ICR).
Priority:
1) global.imagePullSecrets.value
2) icrkey (ultra-simple alias)
3) icrKey (alternative casing alias)
Returns empty string if none provided.
*/}}
{{- define "qiskit-studio.icr.effectiveKey" -}}
{{- coalesce .Values.global.imagePullSecrets.value .Values.icrkey .Values.icrKey | default "" -}}
{{- end -}}

{{/*
Resolve the imagePullSecret name to use.
Priority:
1) .Values.global.imagePullSecrets.name (explicit)
2) default to "<fullname>-icrkey"
*/}}
{{- define "qiskit-studio.icr.secretName" -}}
{{- if .Values.global.imagePullSecrets.name -}}
{{- .Values.global.imagePullSecrets.name -}}
{{- else -}}
{{- printf "%s-icrkey" (include "qiskit-studio.fullname" .) -}}
{{- end -}}
{{- end -}}

{{/*
Return the imagePullSecret name if either a name is set explicitly or an effective key is provided.
*/}}
{{- define "qiskit-studio.imagePullSecretName" -}}
{{- if .Values.global.imagePullSecrets.name -}}
{{- .Values.global.imagePullSecrets.name -}}
{{- else -}}
    {{- $key := include "qiskit-studio.icr.effectiveKey" . -}}
    {{- if $key -}}
        {{- include "qiskit-studio.icr.secretName" . -}}
    {{- else -}}
        {{- "" -}}
    {{- end -}}
{{- end -}}
{{- end -}}