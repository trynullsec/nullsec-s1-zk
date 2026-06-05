# Nullsec S1-ZK AI Reasoning Interface

This module prepares Nullsec S1-ZK for future AI-assisted audit reasoning without calling external AI APIs in v1.

The deterministic scanner produces issues from static analysis. The prompt builder can turn an issue and surrounding code into a structured reasoning request for future workflows such as exploitability assessment, patch guidance, audit report language, and spec-to-circuit comparison.

v1 does not claim model-backed verification and does not send circuit code to any external service.
