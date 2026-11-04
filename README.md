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
	|-- <b>&nbsp;main/</b> //contains all of the source code for TetrisHelper.
		|--<b>&nbsp;api/</b> //Folder that contains all of the scripts that relate to the backend.
			|--<b>&nbsp;proxy.js</b> //JavaScript script that handles API calls to Jstris.
			|--<b>&nbsp;backendProxy.js</b> //JavaScript script that handles all leaderboard API calls to the database.
		|--<b>&nbsp;APIscripts.js</b> //JavaScript scripts that handle API calls to our proxy and handles everything that relates to the front-end.
		|--<b>&nbsp;index.html</b> //HTML structure of the front-page of Tetris Helper.
		|--<b>&nbsp;style.css</b> //Styling for the HTML file of the front-page.
	</pre>




<h1>🚀 TetrisHelper – Installation &amp; Setup Guide</h1>
  <div class="section">
    <h2>📂 1. Get the Project</h2>
    <ul>
      <li>Clone or download this repo to your machine.</li>
      <li><strong>Frontend files:</strong> <code>main/index.html</code>, <code>main/style.css</code>, <code>main/APIscripts.js</code>.</li>
      <li><strong>Backend files:</strong> <code>main/api/backendProxy.js</code>, <code>main/api/proxy.js</code> — these run as Vercel functions.</li>
    </ul>
  </div>

  <div class="section">
    <h2>🛠️ 2. Install Requirements</h2>
    <ol>
      <li>Make sure Node.js (<code>&gt;=18</code>) is installed.</li>
      <li>From the project root, install dependencies:</li>
    </ol>
    <pre><code>npm install</code></pre>
    <p>This installs: <code>@libsql/client</code>.</p>
  </div>

  <div class="section">
    <h2>⚙️ 3. Configure Database</h2>
    <ul>
      <li>The leaderboard is stored in a <a href="https://turso.tech">Turso</a> database.</li>
      <li>Set <code>TURSO_DATABASE_URL</code> and <code>TURSO_AUTH_TOKEN</code> in your Vercel project's environment variables.</li>
      <li>The <code>leaderboard</code> table is created automatically if it is missing.</li>
    </ul>
  </div>

  <div class="section">
    <h2>🌐 4. Deploy</h2>
    <ul>
      <li>Deploy to Vercel with <code>main</code> as the project's root directory.</li>
      <li>The frontend (<code>APIscripts.js</code>) calls the backend with relative URLs, like:</li>
    </ul>
    <pre><code>/api/backendProxy?endpoint=leaderboard</code></pre>
    <ul>
      <li class="endpoints"><strong>Endpoints:</strong>
        <ul>
          <li><code>GET leaderboard</code> — view all leaderboard entries</li>
          <li><code>POST leaderboard</code> — add a player</li>
          <li><code>GET leaderboard/:username</code> — get player by username</li>
          <li><code>PUT leaderboard/:username</code> — update a player's stats</li>
          <li><code>DELETE leaderboard/:username</code> — delete entry</li>
        </ul>
      </li>
    </ul>
  </div>

  <div class="section">
    <h2>✅ 5. Test Everything</h2>
    <ol>
      <li>Open your deployed site in the browser.</li>
      <li>Try adding usernames — the leaderboard should update using your Turso database.</li>
    </ol>
  </div>
