// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Varaibles for API data
 * latest.admissions.act_scores.midpoint.cumulative
 * latest.admissions.admission_rate.overall
 * latest.admissions.sat_scores.average.overall
 * latest.completion.completion_rate_4yr_100nt
 * latest.cost.avg_net_price.other_academic_year
 * latest.cost.avg_net_price.overall
 * latest.cost.avg_net_price.private
 * latest.cost.avg_net_price.program_year
 * latest.cost.avg_net_price.public
 * latest.cost.tuition.in_state
 * latest.cost.tuition.out_of_state
 * latest.cost.tuition.program_year
 * latest.student.demographics.men
 * latest.student.demographics.race_ethnicity.aian
 * latest.student.demographics.race_ethnicity.asian
 * latest.student.demographics.race_ethnicity.black
 * latest.student.demographics.race_ethnicity.hispanic
 * latest.student.demographics.race_ethnicity.nhpi
 * latest.student.demographics.race_ethnicity.non_resident_alien
 * latest.student.demographics.race_ethnicity.two_or_more
 * latest.student.demographics.race_ethnicity.unknown
 * latest.student.demographics.race_ethnicity.white
 * latest.student.demographics.women
 * latest.student.size
 * school.city
 * school.minority_serving.historically_black
 * school.name
 * school.ownership
 * school.school_url
 * school.state
 * school.main_campus
 * school.branches
 */

function getSchoolInfo() {
  const schoolSearch = document.getElementById('school-search').value;

  // Get School Data from API.
  fetch(getLink(schoolSearch))
  .then((response) => response.text())
  .then((data) => {
    parsedData = JSON.parse(data);

    let dataResults = [];
    let sateliteCampusesList = [];
    // Checks if there is main campus 
    if (parsedData.length == 1) {
      dataResults = data[0];
    } else {
      parsedData.results.forEach((campus) => {
        if (campus['school.main_campus'] == 1) {
          dataResults = campus;
        } else if (campus['school.main_campus'] == 0){
          sateliteCampusesList.push(campus)
        }
      });
      // get data result to be main campus
      // get satellites links and names
    }

    // Basic School Information.
    let ownership = '';
    if (dataResults['school.ownership'] == 1) {
      ownership = 'public';
    } else {
      ownership = 'private';
    }
    const name = dataResults['school.name'];
    const city = dataResults['school.city'];
    const state = dataResults['school.state']

    const schoolDesc = document.getElementById('school-desc');
    schoolDesc.innerHTML = '';
    schoolDesc.append(name + ' is a ' + ownership + 
        ' University in ' + city + ', ' + state);
    
    // Cost Statistics Variables.
    const inStateTuition = dataResults['latest.cost.tuition.in_state'];
    const outOfStateTuition = dataResults['latest.cost.tuition.out_of_state']
    const costDiv = document.getElementById('cost');
    costDiv.innerHTML = '';
    costDiv.append('In-State Tuition: $' + inStateTuition);
    costDiv.append('Out-of-State Tuition: $' + outOfStateTuition);
    
    // Admissions Statistics Variables.
    const acceptanceRate = 
        dataResults['latest.admissions.admission_rate.overall'] * 100;
    const avgSAT = 
        dataResults['latest.admissions.sat_scores.average.overall'];
    const avgACT = 
        dataResults['latest.admissions.act_scores.midpoint.cumulative'];

    // Student Statistic Variables.
    const numStudents = dataResults['latest.student.size'];
    const raceHeader = 'latest.student.demographics.race_ethnicity.';
    const numWhiteStudents = dataResults[raceHeader + 'white'] * numStudents;
    const numAsianStudents = dataResults[raceHeader + 'asian'] * numStudents;
    const numBlackStudents = dataResults[raceHeader + 'black'] * numStudents;
    const numHispanicStudents = 
        dataResults[raceHeader + 'hispanic'] * numStudents;
    const numIndigenousStudents = 
        dataResults[raceHeader + 'aian'] * numStudents;
    const numMultiracialStudents = 
        dataResults[raceHeader + 'two_or_more'] * numStudents;
    const numUnreportedRaceStudnets = (dataResults[raceHeader + 'unknown'] + 
        dataResults[raceHeader + 'non_resident_alien']) * numStudents;
    const numMen = 
        dataResults['latest.student.demographics.men'] * numStudents;
    const numWomen = 
        dataResults['latest.student.demographics.women'] * numStudents;
    const graduationRate4yr = 
        dataResults['latest.completion.completion_rate_4yr_100nt'];

    schoolHeader = document.getElementById('school-name');
    schoolHeader.innerHTML = '';
    schoolHeader.append(dataResults['school.name']);

    // Admissions Divs
    const admissionsDiv = document.getElementById('admissions');
    admissionsDiv.innerHTML = '';
    admissionsDiv.append('Acceptance Rate: ' + acceptanceRate + '%');
    admissionsDiv.append('Average SAT Score: ' + avgSAT);
    admissionsDiv.append('Average ACT Score: ' + avgACT);

    // Load the Visualization API and the corechart package.
    google.charts.load('current', {'packages':['corechart']});

    // Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(drawRaceChart);
    google.charts.setOnLoadCallback(drawGenderChart);
    
    const studentsDiv = document.getElementById("students");
    studentsDiv.innerHTML = '';
    studentsDiv.append('Population: ' + numStudents + ' Students');
    studentsDiv.append('4 Year Graduation Rate: ' + graduationRate4yr * 100 + 
        '%');

    function drawRaceChart() {
      let data = google.visualization.arrayToDataTable([
        ['Race', 'Percentage'],
        ['White', numWhiteStudents],
        ['Asian', numAsianStudents],
        ['Black', numBlackStudents],
        ['Hispanic', numHispanicStudents],
        ['Indigenous Ameircan/Alaskan', numIndigenousStudents],
        ['Two or More Races', numMultiracialStudents],
        ["Unreported", numUnreportedRaceStudnets],
      ]);

      let options = {
        title: 'Breakdown by Race',
        pieHole: 0.4,
        colors: ['#C6ACA4', '#A4C5C6', '#FFEB99', 
            '#856C8B', '#C6BDA4', '#D4EBD0', '#C68B77'],
      };

      let chart = new google.visualization.PieChart
          (document.getElementById('race-piechart'));
      chart.draw(data, options);
    }

    function drawGenderChart() {
      let data = google.visualization.arrayToDataTable([
        ['Gender', 'Percentage'],
        ['Men', numMen],
        ['Women', numWomen],
      ]);

      let options = {
        title: 'Breakdown by Gender',
        pieHole: 0.4,
        colors: ['#D4EBD0', '#A4C5C6'],
      };

      let chart = new google.visualization.PieChart
          (document.getElementById('gender-piechart'));
      chart.draw(data, options);
    }
  });
}

function getLink(schoolName) {
  return ('https://api.data.gov/ed/collegescorecard/v1/schools.json?' +
      'api_key=C8Uyh2jQCmfjfKN3qwqwcJOi77c5k3V6zM7cRFgJ&school.name=' + 
      schoolName + '&fields=id,school.city,school.name,school.state,school' +
      '.school_url,school.ownership,school.minority_serving.' +
      'historically_black,latest.admissions.admission_rate.overall,' +
      'latest.admissions.sat_scores.average.overall,latest.admissions' +
      '.act_scores.midpoint.cumulative,latest.cost.tuition,latest.cost' +
      '.avg_net_price,latest.student.size,latest.student.demographics' +
      '.race_ethnicity.white,latest.student.demographics.race_ethnicity' +
      '.black,latest.student.demographics.race_ethnicity.hispanic,' +
      'latest.student.demographics.race_ethnicity.asian,latest' +
      '.student.demographics.race_ethnicity.aian,latest.student.demographics' +
      '.race_ethnicity.nhpi,latest.student.demographics.race_ethnicity' +
      '.two_or_more,latest.student.demographics.race_ethnicity' +
      '.non_resident_alien,latest.student.demographics.race_ethnicity' +
      '.unknown,latest.student.demographics.men,latest.student' +
      '.demographics.women,latest.completion.completion_rate_4yr_100nt,' +
      'school.main_campus,school.institutional_characteristics.level')
}

/** Adds comments to page. */
function loadComments() {
  fetch('/data').then(response => response.json()).then((comments) => {
    const commentListElement = document.getElementById('comments-container');
    comments.forEach((comment) => {
      commentListElement.appendChild(createCommentElement(comment.name,
          comment.message, comment.time));
    });
  });
}

/**
 * @param {string} name The name of the user who commented.
 * @param {string} message The message body of a comment post.
 * @param {string} time The time of a comment post.
 * @return {!HTMLParagraphElement}} A comment paragraph item.
 */
function createCommentElement(name, message, time) {
  const commentElement = document.createElement('p');
  commentElement.innerText = name + ' posted ' + message + ' on ' + time;
  return commentElement;
}
