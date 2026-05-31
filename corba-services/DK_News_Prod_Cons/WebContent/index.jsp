<%@ page language='java' contentType='text/html; charset=UTF-8' pageEncoding='UTF-8' %>
   <html>

   <head>
      <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
      <meta name='Author' content='dsa069'>
      <meta name='Description' content='University of Almeria (Spain)'>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <title>Gestor de Noticias Productor-Consumidor</title>
      <style>
         :root {
            --bg-1: #f7efe5;
            --bg-2: #e9f0ff;
            --panel: #ffffff;
            --ink: #1e293b;
            --muted: #64748b;
            --brand: #0f766e;
            --brand-strong: #115e59;
            --line: #dbe3ef;
            --shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
            --radius: 16px;
         }

         * {
            box-sizing: border-box;
         }

         body {
            margin: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: var(--ink);
            background:
               radial-gradient(circle at 18% 20%, rgba(15, 118, 110, 0.2), transparent 40%),
               radial-gradient(circle at 85% 8%, rgba(56, 189, 248, 0.2), transparent 35%),
               linear-gradient(120deg, var(--bg-1), var(--bg-2));
            min-height: 100vh;
            padding: 28px 14px;
         }

         .layout {
            max-width: 920px;
            margin: 0 auto;
         }

         .panel {
            background: var(--panel);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            overflow: hidden;
         }

         .header {
            padding: 24px 28px 18px;
            background: linear-gradient(135deg, #0f766e, #0c4a6e);
            color: #ffffff;
         }

         .header h1 {
            margin: 0;
            font-size: 1.6rem;
            font-weight: 700;
            letter-spacing: 0.2px;
         }

         .header p {
            margin: 8px 0 0;
            color: rgba(255, 255, 255, 0.9);
            font-size: 0.95rem;
         }

         form {
            padding: 24px 28px 28px;
         }

         .field {
            margin-bottom: 16px;
         }

         label {
            display: block;
            margin-bottom: 7px;
            font-size: 0.92rem;
            font-weight: 600;
            color: #0f172a;
         }

         input,
         select,
         textarea {
            width: 100%;
            border: 1px solid var(--line);
            background: #f8fafc;
            color: var(--ink);
            border-radius: 10px;
            padding: 10px 12px;
            font-size: 0.96rem;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
         }

         input:focus,
         select:focus,
         textarea:focus {
            outline: none;
            border-color: #22d3ee;
            box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.2);
            background: #ffffff;
         }

         textarea {
            resize: vertical;
            min-height: 160px;
         }

         .actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 20px;
         }

         .actions input {
            width: auto;
            border: none;
            border-radius: 999px;
            padding: 9px 16px;
            font-weight: 600;
            cursor: pointer;
            background: #e2e8f0;
            color: #0f172a;
         }

         .actions input[type='submit'] {
            background: var(--brand);
            color: #ffffff;
         }

         .actions input[type='submit']:hover {
            background: var(--brand-strong);
         }

         .actions input[type='reset'] {
            background: #dbeafe;
            color: #1e3a8a;
         }

         @media (max-width: 720px) {
            .header {
               padding: 20px 18px 16px;
            }

            form {
               padding: 18px;
            }

            .actions input {
               flex: 1 1 140px;
               text-align: center;
            }
         }
      </style>
   </head>

   <body>
      <main class='layout'>
         <section class='panel'>
            <header class='header'>
               <h1>Gestor de Noticias</h1>
               <p>Formulario Productor-Consumidor</p>
            </header>

            <form action='<%= request.getContextPath() %>/servlet' method='post'>
               <div class='field'>
                  <label for='fecha'>Fecha (dd/mm/aaaa):</label>
                  <input id='fecha' name='fecha' size='20'>
               </div>

               <div class='field'>
                  <label for='jugador'>Nombre del jugador (2-50 caracteres):</label>
                  <input id='jugador' name='jugador' size='60'>
               </div>

               <div class='field'>
                  <label for='interes'>Interes:</label>
                  <select id='interes' name='interes'>
                     <option value='alta'>alta</option>
                     <option value='media'>media</option>
                     <option value='baja'>baja</option>
                  </select>
               </div>

               <div class='field'>
                  <label for='titulo'>Titulo:</label>
                  <input id='titulo' name='titulo' size='60'>
               </div>

               <div class='field'>
                  <label for='descripcion'>Descripcion:</label>
                  <textarea id='descripcion' name='descripcion' rows='8' cols='70'></textarea>
               </div>

               <div class='field'>
                  <label for='etiquetas'>Etiquetas (ej: #musica #festivalAlmeria):</label>
                  <input id='etiquetas' name='etiquetas' size='60'>
               </div>

               <div class='field'>
                  <label for='indice'>Indice para leer en:</label>
                  <input id='indice' name='indice' type='number' min='0' size='10'>
               </div>

               <div class='field'>
                  <label>Límite máximo fijo:</label>
                  <div class='buffer-count'>30 noticias</div>
               </div>

               <div class='actions'>
                  <input value='Enviar' alt='Press button to export' type='submit' name='action'>
                  <input value='Obtener todas' alt='Press button to export' type='submit' name='action'>
                  <input value='Leer en' alt='Press button to export' type='submit' name='action'>
                  <input value=' Reset ' type='reset' name='action'>
               </div>
            </form>
         </section>
      </main>
   </body>

   </html>