# C2H

Retrieves content from a Contentful blog, and renders it into .md files suitable for compilation with Hugo.

## Configuration

Optionally uses a `config.yaml` file to store Contentful credentials. Use it by specifying the `-c` / `--config` parameter and a path to a file looking like this:

```yaml
space: CONTENTFUL_SPACE_ID
accessToken: CONTENTFUL_ACCESS_TOKEN
```
