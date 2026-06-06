<h1>Team Name: <i>IdeaForge</i></h1>

<h2>Member Roles:</h2>
<ul>
	<li>Daniel — BackEnd/FrontEnd | <a href="https://github.com/AtomicRecall/">GitHub </a></li>
	<li>Yevgeniy — UI/UX/FrontEnd | <a href="https://github.com/yevexe/">GitHub </a></li>
	<li>Arsen — Researcher | <a href="https://github.com/YaArsen">GitHub </a></li>
</ul>

<h2>Project Idea <b>(v.0.1.0)</b>:</h2>
<p><b><a href="https://tetris-helper.vercel.app">TetrisHelper</a></b></p>
<p>Jstris is a fast-paced, browser-based Tetris game with a competitive community and a public API that tracks detailed user and gameplay data. This project transforms that data into a personalized analytics tool designed to help players better understand and improve their performance.

By entering a Jstris username, users can instantly view a streamlined overview of their key stats and gameplay history. The site goes beyond surface-level metrics by analyzing deeper trends—such as progression in personal best times, consistency and peaks in attacks per minute, average game duration, win rate, and daily activity habits. It also includes the ability to compare two players side by side to uncover patterns, similarities, and differences in their styles of play. The goal is to provide clear, actionable insights that can help any player, from casual to competitive, become more aware of their habits and make meaningful improvements.</p>

<p>
	<h2>Repository Structure</h2>
	<pre>
<b>TetrisHelper/</b> //is the folder that contains all files related to this project.
	|-- <b>&nbsp;Main/</b> //contains all of the source code for TetrisHelper.
		|--<b>&nbsp;MemberIntroductions/</b> //Folder that contains all of the developer's introductions.
		|--<b>&nbsp;api/</b> //Folder that contains all of the scripts that relate to the backend.
			|--<b>&nbsp;proxy.js</b> //JavaScript script that handles API calls to Jstris.
			|--<b>&nbsp;backendProxy.js</b> //JavaScript script that handles API calls back to the database.
			|--<b>&nbsp;backend.js</b> //JavaScript script that handles all database API calls.
			|--<b>&nbsp;leaderboardModel.js</b> //JavaScript script that creates the leaderboard.sqlite database and puts it with that specific schema.
		|--<b>&nbsp;APIScripts.js</b> //JavaScript scripts that handle API calls to our proxy and handles everything that relates to the front-end.
		|--<b>&nbsp;css-style-resetter.css</b> //CSS code to help give further control to how the browser renders the website
		|--<b>&nbsp;index.html</b> //HTML structure of the front-page of Tetris Helper.
		|--<b>&nbsp;style.css</b> //Styling for the HTML file of the front-page. 
	</pre>




<h1>🚀 TetrisHelper – Local Installation &amp; Setup Guide</h1>
  <div class="section">
    <h2>📂 1. Get the Project</h2>
    <ul>
      <li>Clone or download this repo to your machine.</li>
      <li><strong>Frontend files:</strong> <code>index.html</code>, <code>style.css</code>, <code>APIscripts.js</code>, <code>css-style-resetter.css</code> — deploy on Vercel or GitHub Pages.</li>
      <li><strong>Backend files:</strong> <code>backend.js</code>, <code>backendProxy.js</code>, <code>leaderboardModel.js</code>, <code>proxy.js</code> — run on your server PC.</li>
    </ul>
  </div>

  <div class="section">
    <h2>🛠️ 2. Install Requirements</h2>
    <ol>
      <li>Make sure Node.js (<code>&gt;=18</code>) is installed.</li>
      <li>From the project root, install dependencies:</li>
    </ol>
    <pre><code>npm install</code></pre>
    <p>This installs: <code>express</code>, <code>cors</code>, <code>dotenv</code>, <code>sqlite3</code>, <code>sequelize</code>, <code>node-fetch</code>.</p>
  </div>

  <div class="section">
    <h2>⚙️ 3. Configure Database</h2>
    <ul>
      <li>The backend uses SQLite and creates <code>leaderboard.sqlite</code> locally.</li>
      <li>No extra setup is required unless you want to change DB settings (see <code>leaderboardModel.js</code>).</li>
    </ul>
  </div>

  <div class="section">
    <h2>▶️ 4. Run the Backend</h2>
    <p>Start the server:</p>
    <pre><code>node api/backend.js</code></pre>
    <ul>
      <li>Runs on <code>http://localhost:8080</code> by default.</li>
      <li class="endpoints"><strong>Endpoints:</strong>
        <ul>
          <li><code>/connect</code> — test server connection</li>
          <li><code>/leaderboard</code> — view all leaderboard entries</li>
          <li><code>/leaderboard/:username</code> — get player by username</li>
          <li><code>/leaderboard/destroy/:username</code> — delete entry</li>
        </ul>
      </li>
    </ul>
  </div>

  <div class="section">
    <h2>🔀 5. Proxy Setup</h2>
    <ul>
      <li><code>backendProxy.js</code> / <code>proxy.js</code> forward API requests between frontend and backend.</li>
      <li>Frontend calls look like:</li>
    </ul>
    <pre><code>https://&lt;your-vercel-domain&gt;/api/backendProxy?endpoint=leaderboard</code></pre>
    <ul>
      <li>Ensure Vercel routes <code>/api/*</code> to these proxy files.</li>
    </ul>
  </div>

  <div class="section">
    <h2>🌐 6. Deploy the Frontend</h2>
    <ul>
      <li>Deploy <code>index.html</code>, CSS, and JS files to Vercel or GitHub Pages.</li>
      <li>The frontend (<code>APIscripts.js</code>) fetches data via the backend proxy.</li>
    </ul>
  </div>

  <div class="section">
    <h2>✅ 7. Test Everything</h2>
    <ol>
      <li>Open your deployed frontend in the browser.</li>
      <li>Check the console — you should see <em>Connection successful!</em></li>
      <li>Try adding usernames — the leaderboard should update using your SQLite DB on the server PC.</li>
    </ol>
  </div>
