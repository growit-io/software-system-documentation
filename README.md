# Software System Documentation

This GitHub template repository provides a starting point for working collaboratively on the documentation of a potentially complex software system. Its features include:

- Readable in the GitHub UI, without GitHub Pages or another hosted service
- Automatically generated architecture diagrams defined in the [Structurizr DSL](https://structurizr.com/help/dsl)
- Interactive viewing and presentation in the [Structurizr Lite](https://structurizr.com/help/lite) application

## How to use this template

To use this template, simply create a new GitHub repository and select this repository as a template.

Once the cloning operation has finished, configure your desired repository settings, review the included [GitHub Actions configuration](.github), if you like, adjust the contents of this README.md file, and start documenting your software system by modifying markdown files in the [docs](docs) directory and the corresponding architecture model in the [workspace.dsl](workspace.dsl) file.

Simon Brown, creator of the Structurizr DSL, recommends that you also manage the source code of the software system itself in the same repository as its documentation. That way it not only becomes easier to compare the architecture model and its implementation, but it also beceomes easier to use advanced techniques to _generate_ parts of the architecture model, if you dare.

## How to work locally

The recommended development workflow is to view the diagrams and documentation locally via the [Structurizr Lite](https://structurizr.com/help/lite) application in your browser as you are making changes to the source files, _before_ you commit and push your changes.

### Prerequisites

- [GNU Make](https://www.gnu.org/software/make/) (comes preinstalled on many operating systems)
- [Docker](https://www.docker.com/) (follow their [installation guide](https://docs.docker.com/engine/install/))

### How to run Structurizr Lite

Run the following command from the top-level directory of this repository to start the Structurizr Lite web application in the background, and then open it in a browser window:

```bash
make start open
```

To stop the application again when you're done using it, run:

```bash
make stop
```

Note that you'll have to reload the page whenever you make changes to the Structurizr DSL or markdown source files to see the changes.

### How to export the diagrams

Normally there shouldn't be a need to update the [exported diagrams](docs/diagrams) manually, since the Structurizr Lite application renders them dynamically, and the [Structurizr workflow](.github/workflows/structurizr-lite.yml) for GitHub Actions will automatically update the diagrams whenever you push a commit which modifies the Structurizr DSL input files. However, you can still export the diagrams directly from your working copy without having to first commit and push your changes. To do that, simply run the following command from the top-level directory:

```
make export
```

Note that the previous command will automatically start the Structurizr Lite application, and keep it running in the background. If you *don't* want to keep the application running in the background, you can use the following command, instead:

```
make export stop
```

## Resources

- [Structurizr DSL cookbook](https://github.com/structurizr/dsl/tree/master/docs/cookbook#readme)
- [Structurizr DSL language reference](https://github.com/structurizr/dsl/blob/master/docs/language-reference.md#language-reference)

## License

[The Unlicense](LICENSE)

## Acknowledgements

The [Software System Documentation](https://github.com/growit-io/software-system-documentation) template repository was created with 🥳 by [Uwe Stuehler](https://github.com/ustuehler), and with much admiration for Simon Brown's work on the [C4 model](https://c4model.com/) and on [Structurizr](https://structurizr.com/). 🙇
