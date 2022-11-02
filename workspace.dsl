// https://github.com/structurizr/dsl/blob/master/docs/language-reference.md

workspace "Software System" {
  model {
    user = person "User"
    developer = person "Developer"
    maintainer = person "Maintainer"

    softwareSystem = softwareSystem "Software System" {
      !docs docs
    }

    user -> softwareSystem "Uses"
    developer -> softwareSystem "Develops"
    maintainer -> softwareSystem "Maintains"
  }

  views {
    systemContext softwareSystem "Overview" {
      include *
      autoLayout
    }

    styles {
      element "Element" {
        shape RoundedBox
      }

      element "Person" {
        shape person
      }

      element "Software System" {
        background #1168bd
        color #ffffff
      }
    }
  }
}
