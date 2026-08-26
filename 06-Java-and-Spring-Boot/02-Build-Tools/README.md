# 🛠️ Build Tools — Apache Maven

This folder covers Apache Maven architecture, lifecycles, dependency management, and plugins commonly asked in backend and Java interviews.

---

## 📑 Contents

- 📝 **[Maven.md](./Maven.md)**:
  - Standard Project Layout (`src/main/java`, `src/test/java`, `pom.xml`)
  - Maven Lifecycles: `clean`, `default` (`validate`, `compile`, `test`, `package`, `verify`, `install`, `deploy`), `site`
  - Dependency Scopes: `compile`, `provided`, `runtime`, `test`, `system`, `import`
  - Transitive Dependencies, Conflict Resolution (Nearest-definition wins), and Dependency Exclusions
  - Plugins vs Goals (`compiler`, `surefire`, `spring-boot-maven-plugin`)
