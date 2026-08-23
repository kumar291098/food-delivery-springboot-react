# 🔴 Red Hat OpenShift Deployment & Logging Guide

This directory contains the Kubernetes & OpenShift Custom Resource Definitions (CRDs) for deploying the Food Delivery Platform and configuring enterprise OpenShift Cluster Logging (Vector + LokiStack).

---

## 📁 Manifest Directory Structure

```text
openshift/
├── logging/
│   ├── cluster-logging.yaml         # Configures Red Hat Vector collector + LokiStack storage
│   └── cluster-log-forwarder.yaml   # Routes microservice container logs with JSON parsing
└── deployments/
    └── food-delivery-apps.yaml      # Deployments, Services, and TLS Routes
```

---

## 🚀 How to Deploy on OpenShift

### 1. Connect to your OpenShift Cluster
```bash
oc login -u <username> -p <password> --server=https://api.<cluster-domain>:6443
```

### 2. Apply the Microservices & Routes
```bash
oc apply -f openshift/deployments/food-delivery-apps.yaml
```

### 3. Enable OpenShift Cluster Logging
1. Install **Red Hat OpenShift Logging Operator** and **Loki Operator** from OperatorHub.
2. Apply logging custom resources:
```bash
oc apply -f openshift/logging/cluster-logging.yaml
oc apply -f openshift/logging/cluster-log-forwarder.yaml
```

### 4. View Logs in OpenShift Web Console
1. Open the OpenShift Web Console.
2. Navigate to **Observe ➔ Logs**.
3. Select the `food-delivery` namespace to view structured JSON logs, search by `traceId`, and inspect live stream logs.
