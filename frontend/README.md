## fly.io

### Deploying the bug-less-frontend

You should [install flyctl](https://fly.io/docs/hands-on/install-flyctl/) and follow the instructions to login and create an app.

```shell
fly auth login
fly apps create bug-less-frontend
```

Now we should build the image locally and send it to the fly.io registry.

We're defining the GRAPHQL_ENDPOINT build argument to define the validator graphql backend URL.

```shell
docker image build \
    --build-arg NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://bug-less-validator.fly.dev/graphql \
    -t registry.fly.io/bug-less-frontend:latest \
    -f Dockerfile .
fly auth docker
docker push registry.fly.io/bug-less-frontend:latest
```

Now that our image is on the fly.io registry, we can deploy it.

```shell
fly deploy
```

We can follow the app logs with the following command.

```shell
fly logs
```

### Destroying the apps

If you want to destroy the frontend app, you can use the following commands.

```shell
fly apps destroy bug-less-frontend
```
