#!/bin/bash

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NDgxMzBjZi02NWE0LTQyNzEtOTA0OC1hODRiZDc1NjUwYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcwMzMzNzgxfQ.WkGqXb6MyufwIJSZLGMrh_wHbPPtjxSSibKxC3ROrWo"
BASE_URL="https://n8n.gex44.tnfserver.de"

# Create TF Brief Sync workflow
curl -s -X POST "${BASE_URL}/api/v1/workflows" \
  -H "X-N8N-API-KEY: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "TF Brief Sync",
  "settings": {
    "saveExecutionProgress": true,
    "saveManualExecutions": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "executionOrder": "v1"
  },
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "tf-brief-sync",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-trigger",
      "name": "Webhook: TF Brief Sync",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [200, 300],
      "webhookId": "tf-brief-sync-webhook"
    },
    {
      "parameters": {
        "mode": "runOnceForEachItem",
        "jsCode": "const body = $json.body || $json;\nreturn {\n  json: {\n    case_id: body.case_id,\n    change_summary: body.change_summary || \"Brief updated\",\n    changed_by: body.changed_by || \"unknown\"\n  }\n};"
      },
      "id": "parse-input",
      "name": "Parse Input",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [400, 300]
    },
    {
      "parameters": {
        "workflowId": "xpnOcoHAwqtpm6d7",
        "options": {},
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "case_id": "={{ $json.case_id }}"
          }
        }
      },
      "id": "execute-sync-workflow",
      "name": "Execute: Sync Brief to Nextcloud",
      "type": "n8n-nodes-base.executeWorkflow",
      "typeVersion": 1.2,
      "position": [600, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT c.id, c.case_number, c.catchy_case_id, c.project_title, c.slack_channel, b.version FROM tf_cases c LEFT JOIN tf_briefs b ON b.case_id = c.id WHERE c.id = $1::uuid LIMIT 1;",
        "options": {
          "queryReplacement": "={{ [$(\"Parse Input\").item.json.case_id] }}"
        }
      },
      "id": "fetch-case-for-slack",
      "name": "Fetch Case for Slack",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.6,
      "position": [800, 300]
    },
    {
      "parameters": {
        "mode": "runOnceForEachItem",
        "jsCode": "const caseData = $json;\nconst inputData = $(\"Parse Input\").item.json;\nconst syncResult = $(\"Execute: Sync Brief to Nextcloud\").item.json;\n\nconst message = `:memo: *Brief Updated*\\n\\n*${caseData.project_title || \"Project\"}* (${caseData.catchy_case_id || caseData.case_number})\\n\\n:pencil2: Changes: ${inputData.change_summary}\\n:bust_in_silhouette: By: ${inputData.changed_by}\\n:page_facing_up: Version: ${caseData.version || 1}\\n\\n:link: Synced to Nextcloud`;\n\nreturn {\n  json: {\n    slack_channel: caseData.slack_channel,\n    message: message,\n    case_id: caseData.id,\n    version: caseData.version || 1,\n    success: true\n  }\n};"
      },
      "id": "build-slack-message",
      "name": "Build Slack Message",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1000, 300]
    },
    {
      "parameters": {
        "authentication": "oAuth2",
        "select": "channel",
        "channelId": {
          "__rl": true,
          "value": "={{ $json.slack_channel }}",
          "mode": "name"
        },
        "text": "={{ $json.message }}",
        "otherOptions": {
          "includeLinkToWorkflow": false
        }
      },
      "id": "post-to-slack",
      "name": "Post to Slack",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.3,
      "position": [1200, 300],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({ success: true, version: $json.version || $(\"Build Slack Message\").item.json.version }) }}",
        "options": {}
      },
      "id": "respond-webhook",
      "name": "Respond Success",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [1400, 300]
    }
  ],
  "connections": {
    "Webhook: TF Brief Sync": {
      "main": [
        [
          {
            "node": "Parse Input",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Parse Input": {
      "main": [
        [
          {
            "node": "Execute: Sync Brief to Nextcloud",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute: Sync Brief to Nextcloud": {
      "main": [
        [
          {
            "node": "Fetch Case for Slack",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Case for Slack": {
      "main": [
        [
          {
            "node": "Build Slack Message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Build Slack Message": {
      "main": [
        [
          {
            "node": "Post to Slack",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Post to Slack": {
      "main": [
        [
          {
            "node": "Respond Success",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}'
