# Configuración del pipeline E13

El pipeline E13 valida en orden el frontend y el backend, y despliega el servicio correspondiente a la rama promovida. Los workflows están en `.github/workflows/e13-ci-cd.yml` en ambos repositorios.

## Secuencia

1. Validación de sintaxis del backend y compilación de producción del frontend con Vite.
2. Pruebas unitarias del backend con Jest y del frontend con Vitest.
3. Análisis estático de ambos proyectos con ESLint y quality gate local: cero errores y cero advertencias. En `main` y en PRs dirigidos a `main`, también se ejecuta el análisis de SonarCloud y se espera su quality gate.
4. Arranque de MongoDB temporal, inicio de la API y ejecución de la colección Postman con Newman.
5. Despliegue del servicio que cambió a Railway y verificación HTTP posterior.

Las ejecuciones de `featureE13` y de pull requests validan las etapas de CI y omiten el despliegue. El despliegue se ejecuta solamente después de un `push` a `dev`, `release` o `main`.

## Mapeo de ramas

| Rama | Ambiente de GitHub | Destino Railway |
| --- | --- | --- |
| `dev` | `development` | Desarrollo |
| `release` | `qa` | QA |
| `main` | `production` | Producción |

Cada repositorio despliega únicamente su propio servicio: `Task_Management` publica backend y `Task_Management_frontend` publica frontend.

## Secretos y variables requeridos

Configurar los siguientes valores en **cada repositorio** y en cada ambiente de GitHub (`development`, `qa`, `production`):

| Tipo | Nombre | Valor esperado |
| --- | --- | --- |
| Secreto | `RAILWAY_TOKEN` | Token de proyecto Railway autorizado para el ambiente correspondiente. |
| Variable | `RAILWAY_PROJECT_ID` | ID del proyecto Railway. |
| Variable | `RAILWAY_ENVIRONMENT_ID` | ID del ambiente Railway de destino. |
| Variable | `RAILWAY_SERVICE_ID` | ID del servicio de este repositorio en ese ambiente. |
| Variable en backend | `RAILWAY_HEALTH_URL` | URL base de la API; el pipeline consulta `/health`. |
| Variable en frontend | `RAILWAY_SMOKE_URL` | URL base del frontend, sin `/login`; el pipeline agrega esa ruta. |

Agregar `SONAR_TOKEN` como secreto de Actions a nivel de **repositorio** en ambos repositorios (o como secreto de organización disponible para ambos). Se usa cuando SonarCloud corre en `main` o en un PR dirigido a `main`. El análisis usa el proyecto `altair222000_Task_Management` definido en `sonar-project.properties` del backend.

### Requisito del plan de SonarCloud

La organización de SonarCloud asociada a este proyecto rechaza el quality gate remoto en ramas distintas de `main`. Para que las ramas de trabajo no se queden bloqueadas por ese límite, el workflow ejecuta ESLint en backend y frontend con cero errores y cero advertencias como quality gate local. SonarCloud se ejecuta en `main` y en PRs cuyo destino es `main`, donde el plan actual permite consultar el gate.

Si más adelante se habilita un plan de SonarCloud con análisis de ramas, se puede ampliar la condición del paso SonarCloud para incluir `featureE13`, `dev` y `release`. El resultado local de ESLint no se presenta como un análisis de SonarCloud.

### URLs de producción

La URL pública del frontend indicada para la prueba de humo es `https://taskmanagementfrontend-production-52aa.up.railway.app`. Guardar esa URL base (sin `/login`) como `RAILWAY_SMOKE_URL` en el ambiente `production`. La URL base del backend debe coincidir con `VITE_BACKEND_URL` de producción; guardar su raíz como `RAILWAY_HEALTH_URL` y el workflow comprobará `/health`.

Si faltan variables de Railway, el job de despliegue falla de forma explícita; no se omite silenciosamente. El workflow tampoco publica en Railway desde `featureE13` ni desde un pull request.

## Protección de ramas

En GitHub, configurar como verificación requerida el job `E13 · Build, pruebas, quality gate y API` antes de permitir merge a `dev`, `release` y `main`, en ambos repositorios. El workflow ejecuta las validaciones, pero la regla que bloquea merges se configura en la protección de cada rama.
