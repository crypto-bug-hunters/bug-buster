## fly.io

You should install flyctl and follow the instructions to login and create an app.

```shell
fly auth login
fly apps create bug-less-validator
```

We need a PostgreSQL database to store the data. We can create a free one and attach it to the application.

```shell
fly pg create bug-less-database --region gig
fly pg attach bug-less-database bug-less-validator
```

Althoagh we have all the `[env]` configuraion inside `fly.toml`, we need to define some values as secrets.

```shell
fly secrets set CARTESI_BLOCKCHAIN_HTTP_ENDPOINT=<alchemy http endpoint>
fly secrets set CARTESI_BLOCKCHAIN_WS_ENDPOINT=<alchemy ws endpoint>
fly secrets set CARTESI_AUTH_MNEMONIC=<twelve words mnemonic>
fly secrets set CARTESI_POSTGRES_ENDPOINT=<value from the fly pg create output>
```

Now we should build the image locally and send it to the fly.io registry.

```shell
docker image build -t registry.fly.io/bug-less-validator:latest -f bug-less-validator.Dockerfile ../
fly auth docker
docker push registry.fly.io/bug-less-validator:latest
```

Now that out image is on the fly.io registry, we can deploy it.

```shell
flyctl deploy --app bug-less-validator \
    --vm-size=shared-cpu-2x \
    --image registry.fly.io/bug-less-validator:latest
```

We can follow the app logs with the following command.

```shell
flyctl logs --app bug-less-validator
```
