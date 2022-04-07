# adapted from https://github.com/docker-library/mongo/issues/399s
# script to setup mongoDB on initial database creation
mongo -- "$MONGO_INITDB_DATABASE" <<EOF
db.createUser(
  {
    user: "$MONGO_INITDB_ROOT_USERNAME",
    pwd: "$MONGO_INITDB_ROOT_PASSWORD",
    roles: [ { role: "readWrite", db: "$MONGO_INITDB_DATABASE" } ]
  }
)
EOF