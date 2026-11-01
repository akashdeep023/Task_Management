# Configuración del pipeline E13

El pipeline E13 valida en orden el frontend y el backend, y despliega el servicio correspondiente a la rama promovida. Los workflows están en `.github/workflows/e13-ci-cd.yml` en ambos repositorios.

## Secuencia

1. Validación de sintaxis del backend y compilación de producción del frontend con Vite.
2. Pruebas unitarias del backend con Jest y del frontend con Vitest.
3. Análisis del backend en SonarCloud y espera del resultado del quality gate. Si el gate falla, el workflow termina en error.
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

Además, agregar `SONAR_TOKEN` como secreto de Actions en **ambos repositorios** (o como secreto de organización disponible para ambos). El análisis usa el proyecto `altair222000_Task_Management` definido en `sonar-project.properties` del backend.

### Requisito del plan de SonarCloud

La organización de SonarCloud asociada a este proyecto actualmente rechaza la consulta del quality gate en ramas distintas de `main`. El plan Free permite análisis de la rama principal y pull requests cuyo destino sea la rama principal; el análisis de otras ramas requiere Team/Enterprise o un plan OSS habilitado para proyectos de código abierto. Como estos repositorios usan las ramas `featureE13`, `dev` y `release`, se debe habilitar un plan con análisis de ramas antes de promover cambios por ese flujo.

El workflow conserva el control estricto: si SonarCloud no puede entregar el quality gate, no continúa a las pruebas API ni al despliegue. No desactivar `sonar.qualitygate.wait` para hacer pasar una rama sin gate.

### URLs de producción

La URL pública del frontend indicada para la prueba de humo es `https://taskmanagementfrontend-production-52aa.up.railway.app`. Guardar esa URL base (sin `/login`) como `RAILWAY_SMOKE_URL` en el ambiente `production`. La URL base del backend debe coincidir con `VITE_BACKEND_URL` de producción; guardar su raíz como `RAILWAY_HEALTH_URL` y el workflow comprobará `/health`.

Si faltan variables de Railway, el job de despliegue falla de forma explícita; no se omite silenciosamente. El workflow tampoco publica en Railway desde `featureE13` ni desde un pull request.

## Protección de ramas

En GitHub, configurar como verificación requerida el job `E13 · Build, pruebas, quality gate y API` antes de permitir merge a `dev`, `release` y `main`, en ambos repositorios. El workflow ejecuta las validaciones, pero la regla que bloquea merges se configura en la protección de cada rama.
