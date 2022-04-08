# adapted from https://github.com/docker-library/mongo/issues/399s
# script to setup mongoDB on initial database creation with backend and datadog users
mongo -- "$MONGO_INITDB_DATABASE" <<EOF
db.createUser(
  {
    user: "$MONGO_INITDB_ROOT_USERNAME",
    pwd: "$MONGO_INITDB_ROOT_PASSWORD",
    roles: [ { role: "readWrite", db: "$MONGO_INITDB_DATABASE" } ]
  }
)

use admin
db.auth("$MONGO_INITDB_ROOT_USERNAME", "$MONGO_INITDB_ROOT_PASSWORD")

db.createUser({
  "user": "datadog",
  "pwd": "$DATADOG_AGENT_PASSWORD",
  "roles": [
    { role: "read", db: "admin" },
    { role: "clusterMonitor", db: "admin" },
    { role: "read", db: "local" }
  ]
})
EOF