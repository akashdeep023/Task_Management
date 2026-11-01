E11 - Pruebas de API

La colección `task-management.postman_collection.json` contiene 20 solicitudes para la API del proyecto. Cada solicitud valida el estado HTTP, el tipo de contenido JSON, el esquema de respuesta y los datos esperados.

Flujo de negocio cubierto

La colección ejecuta las solicitudes en orden: registra un usuario único, valida inicio de sesión, consulta el perfil, crea una tarea, consulta el tablero y la analítica, cambia su categoría, actualiza sus datos, vuelve a consultarla y finalmente la elimina.


Ambiente

Se necesita Node.js 18.17.1, MongoDB y Newman 6.2.3. Use una base de datos aislada para estas pruebas.
MongoDB local.

```powershell
$env:MONGODB_URI="mongodb://127.0.0.1:27017/task_management_e11"
$env:MONGODB_DB_NAME="task_management_e11"
$env:JWT_SECRET="e11-local-only-secret"
$env:PORT="3000"
npm start
```

3. Desde `backend`, ejecutar la colección:

```powershell
npx --yes newman@6.2.3 run tests/api/task-management.postman_collection.json --env-var "baseUrl=http://127.0.0.1:3000" --reporters cli,json --reporter-json-export reports/api-tests.json
```

Ejecución en GitHub Actions

El workflow `.github/workflows/api-tests.yml` crea un servicio MongoDB temporal, inicia la API con una base `task_management_e11` independiente y ejecuta Newman. Se activa al enviar cambios a `dev`.Reporte JSON se publica como artefacto del workflow.
