#!/bin/bash

API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NDgxMzBjZi02NWE0LTQyNzEtOTA0OC1hODRiZDc1NjUwYjkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzcwMzMzNzgxfQ.WkGqXb6MyufwIJSZLGMrh_wHbPPtjxSSibKxC3ROrWo"
BASE_URL="https://n8n.gex44.tnfserver.de"

# Create TF Project Setup workflow
curl -s -X POST "${BASE_URL}/api/v1/workflows" \
  -H "X-N8N-API-KEY: ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "TF Project Setup",
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
        "path": "tf-project-setup",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-trigger",
      "name": "Webhook: TF Project Setup",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [200, 300],
      "webhookId": "tf-project-setup-webhook"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT c.id as case_id, c.case_number, c.catchy_case_id, c.project_title, c.slack_channel, c.nextcloud_folder, b.id as brief_id, b.client, b.brand, b.analysis, b.version FROM tf_cases c LEFT JOIN tf_briefs b ON b.case_id = c.id WHERE c.id = $1::uuid LIMIT 1;",
        "options": {
          "queryReplacement": "={{ [$json.body.case_id] }}"
        }
      },
      "id": "fetch-case-data",
      "name": "Fetch Case & Brief",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.6,
      "position": [400, 300]
    },
    {
      "parameters": {
        "mode": "runOnceForEachItem",
        "jsCode": "const caseData = $json;\nconst userEmail = $input.first().json.body?.user_email || \"unknown@tracksandfields.com\";\n\n// Generate channel name: tf-{case_number}-{slugified-title}\nconst caseNum = String(caseData.case_number || \"0000\").padStart(4, \"0\");\nconst title = (caseData.project_title || caseData.brand || \"project\").toLowerCase();\nconst slug = title.replace(/[^a-z0-9]+/g, \"-\").replace(/^-|-$/g, \"\").slice(0, 40);\nconst channelName = `tf-${caseNum}-${slug}`;\n\n// Create folder path\nconst year = new Date().getFullYear();\nconst folderPath = `/01 - Team share/Projects/BriefBot/${caseData.case_number} - ${caseData.project_title || slug}`;\n\nreturn {\n  json: {\n    ...caseData,\n    channelName,\n    folderPath,\n    userEmail,\n    year\n  }\n};"
      },
      "id": "generate-names",
      "name": "Generate Channel & Folder Names",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [600, 300]
    },
    {
      "parameters": {
        "authentication": "oAuth2",
        "channel": "={{ $json.channelName }}",
        "options": {
          "isPrivate": false
        }
      },
      "id": "create-slack-channel",
      "name": "Create Slack Channel",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.3,
      "position": [900, 100]
    },
    {
      "parameters": {
        "authentication": "oAuth2",
        "operation": "createFolder",
        "path": "={{ $json.folderPath }}"
      },
      "id": "create-nextcloud-folder",
      "name": "Create Nextcloud Folder",
      "type": "n8n-nodes-base.nextCloud",
      "typeVersion": 1,
      "position": [900, 300],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "authentication": "oAuth2",
        "select": "channel",
        "channelId": {
          "__rl": true,
          "value": "={{ $json.channel?.id || $json.id }}",
          "mode": "id"
        },
        "user": {
          "__rl": true,
          "value": "={{ $(\"Generate Channel & Folder Names\").item.json.userEmail }}",
          "mode": "id"
        }
      },
      "id": "invite-user-slack",
      "name": "Invite User to Slack",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.3,
      "position": [1100, 100],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "authentication": "oAuth2",
        "select": "channel",
        "channelId": {
          "__rl": true,
          "value": "={{ $json.channel?.id || $json.id || $(\"Create Slack Channel\").item.json.channel?.id }}",
          "mode": "id"
        },
        "text": "=:rocket: *New Project Created!*\\n\\n*{{ $(\"Generate Channel & Folder Names\").item.json.project_title || \"Untitled Project\" }}*\\nCase: {{ $(\"Generate Channel & Folder Names\").item.json.catchy_case_id || $(\"Generate Channel & Folder Names\").item.json.case_number }}\\n\\nIntegrations are being set up...",
        "otherOptions": {
          "includeLinkToWorkflow": false
        }
      },
      "id": "post-welcome-slack",
      "name": "Post Welcome to Slack",
      "type": "n8n-nodes-base.slack",
      "typeVersion": 2.3,
      "position": [1300, 100],
      "onError": "continueRegularOutput"
    },
    {
      "parameters": {
        "mode": "runOnceForEachItem",
        "jsCode": "const caseData = $(\"Generate Channel & Folder Names\").item.json;\nconst slackChannel = $(\"Create Slack Channel\").item.json;\nconst nextcloudResult = $(\"Create Nextcloud Folder\").item.json;\n\nconst slackChannelId = slackChannel?.channel?.id || slackChannel?.id || null;\nconst slackChannelName = caseData.channelName;\nconst nextcloudFolderUrl = nextcloudResult?.url || `https://cloud.tracksandfields.com/f/${caseData.folderPath}`;\n\nreturn {\n  json: {\n    case_id: caseData.case_id,\n    slack_channel_id: slackChannelId,\n    slack_channel_name: slackChannelName,\n    nextcloud_folder_url: nextcloudFolderUrl,\n    success: true\n  }\n};"
      },
      "id": "merge-results",
      "name": "Merge Results",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [1500, 200]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "UPDATE tf_cases SET slack_channel = $2, nextcloud_folder = $3, updated_at = NOW() WHERE id = $1::uuid RETURNING id;",
        "options": {
          "queryReplacement": "={{ [$json.case_id, $json.slack_channel_name, $json.nextcloud_folder_url] }}"
        }
      },
      "id": "update-case",
      "name": "Update Case with Integration URLs",
      "type": "n8n-nodes-base.postgres",
      "typeVersion": 2.6,
      "position": [1700, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({ success: true, slack_channel_id: $(\"Merge Results\").item.json.slack_channel_id, slack_channel_name: $(\"Merge Results\").item.json.slack_channel_name, nextcloud_folder_url: $(\"Merge Results\").item.json.nextcloud_folder_url }) }}",
        "options": {}
      },
      "id": "respond-webhook",
      "name": "Respond Success",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.4,
      "position": [1900, 200]
    }
  ],
  "connections": {
    "Webhook: TF Project Setup": {
      "main": [
        [
          {
            "node": "Fetch Case & Brief",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Fetch Case & Brief": {
      "main": [
        [
          {
            "node": "Generate Channel & Folder Names",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate Channel & Folder Names": {
      "main": [
        [
          {
            "node": "Create Slack Channel",
            "type": "main",
            "index": 0
          },
          {
            "node": "Create Nextcloud Folder",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Slack Channel": {
      "main": [
        [
          {
            "node": "Invite User to Slack",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Invite User to Slack": {
      "main": [
        [
          {
            "node": "Post Welcome to Slack",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Post Welcome to Slack": {
      "main": [
        [
          {
            "node": "Merge Results",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Create Nextcloud Folder": {
      "main": [
        [
          {
            "node": "Merge Results",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Merge Results": {
      "main": [
        [
          {
            "node": "Update Case with Integration URLs",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Update Case with Integration URLs": {
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
