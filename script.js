/* global chrome */

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const relativeDateString = date => {
  const NUM_MILLISECONDS_IN_AN_HOUR = 60 * 60 * 1000;
  const NUM_MILLISECONDS_IN_A_DAY = 24 * NUM_MILLISECONDS_IN_AN_HOUR;

  const oneDayAgo = new Date(Date.now() - NUM_MILLISECONDS_IN_A_DAY);
  const oneWeekAgo = new Date(Date.now() - 7 * NUM_MILLISECONDS_IN_A_DAY);

  if (date > oneDayAgo) {
    const numHoursAgo = Math.round(
      (new Date() - date) / NUM_MILLISECONDS_IN_AN_HOUR
    );
    return `${numHoursAgo} hour${numHoursAgo === 1 ? "" : "s"} ago`;
  } else if (date > oneWeekAgo) {
    const numDaysAgo = Math.round(
      (new Date() - date) / NUM_MILLISECONDS_IN_A_DAY
    );
    return `${numDaysAgo} day${numDaysAgo === 1 ? "" : "s"} ago`;
  } else {
    return `${
      MONTH_NAMES[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  }
};

const createResultElement = hit => {
  const resultDiv = document.createElement("div");
  resultDiv.classList.add("result");

  const url = `https://news.ycombinator.com/item?id=${hit.objectID}`;
  const pointsText = `${hit.points} point${hit.points === 1 ? "" : "s"}`;
  const dateText = relativeDateString(new Date(hit.created_at));
  const commentsText = `${hit.num_comments} comment${
    hit.num_comments === 1 ? "" : "s"
  }`;

  resultDiv.innerHTML = `
    <a href="${url}" target="_blank">
      <div class="result__title">${hit.title}</div>
      <div class="result__metadata-container">
        <div class="result__points">${pointsText}</div>
        <div class="result__metadata-separator">|</div>
        <div class="result__date">${dateText}</div>
        <div class="result__metadata-separator">|</div>
        <div class="result__comments">${commentsText}</div>
      </div>
    </a>
  `;

  return resultDiv;
};

chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
  const container = document.getElementById("results-container");

  if (!tabs[0]) {
    container.textContent = "Couldn't load URL of current tab";
    return;
  }

  fetch(
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(
      tabs[0].url
    )}`
  )
    .then(response => response.json())
    .then(response => {
      console.log("response = ", response.hits);
      container.innerHTML = "";

      const stories = response.hits.filter(hit => hit["_tags"][0] === "story");

      if (stories.length > 0) {
        stories
          .map(createResultElement)
          .forEach(resultsDiv => container.appendChild(resultsDiv));
      } else {
        container.textContent = "No results";
      }
    })
    .catch(() => {
      container.textContent =
        "An error occurred when trying to fetch the HN API.";
    });
});
