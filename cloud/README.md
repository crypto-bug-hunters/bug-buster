## fly.io

You should [install flyctl](https://fly.io/docs/hands-on/install-flyctl/) and follow the instructions to login and create an app.

```shell
fly auth login
fly apps create bug-less-validator
```

We need a PostgreSQL database to store the data. We can create a free one and attach it to the application.

```shell
fly postgres create \
    --initial-cluster-size 1 \
    --name bug-less-database \
    --region gig \
    --vm-size shared-cpu-1x \
    --volume-size 1
fly postgres attach bug-less-database
```

Althoagh we have all the `[env]` configuraion inside `fly.toml`, we need to define some values as secrets.

```shell
fly secrets set CARTESI_BLOCKCHAIN_HTTP_ENDPOINT=<alchemy http endpoint>
fly secrets set CARTESI_BLOCKCHAIN_WS_ENDPOINT=<alchemy ws endpoint>
fly secrets set CARTESI_AUTH_MNEMONIC=<twelve words mnemonic>
fly secrets set CARTESI_POSTGRES_ENDPOINT=<value from the `fly postgres attach bug-less-database` output>
```

Now we should build the image locally and send it to the fly.io registry.

```shell
docker image build -t registry.fly.io/bug-less-validator:latest -f bug-less-validator.Dockerfile ../
fly auth docker
docker push registry.fly.io/bug-less-validator:latest
```

Now that our image is on the fly.io registry, we can deploy it.

```shell
fly deploy \
    --app bug-less-validator \
    --ha=false \
    --image registry.fly.io/bug-less-validator:latest \
    --vm-size=shared-cpu-2x
```

We can follow the app logs with the following command.

```shell
fly logs
```
