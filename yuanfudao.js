let fs = require("fs");
let Crawler = require("crawler");

let crawler = null;
let grades = [
  { id: 3, name: "三年级", namePrefix: "", phase: "xiaoxue" },
  { id: 4, name: "四年级", namePrefix: "", phase: "xiaoxue" },
  { id: 5, name: "五年级", namePrefix: "", phase: "xiaoxue" },
  { id: 6, name: "六年级", namePrefix: "", phase: "xiaoxue" },
  { id: 7, name: "七年级", namePrefix: "", phase: "chuzhong" },
  { id: 8, name: "八年级", namePrefix: "", phase: "chuzhong" },
  { id: 9, name: "九年级", namePrefix: "", phase: "chuzhong" },
  { id: 10, name: "高一", namePrefix: "", phase: "gaozhong" },
  { id: 11, name: "高二", namePrefix: "", phase: "gaozhong" },
  { id: 12, name: "高三", namePrefix: "", phase: "gaozhong" }
];

function start() {
  crawler = new Crawler();
  for (var i = 0; i < grades.length; i++) {
    var grade = grades[i];
    getSubject(grade);
  }
}

function getSubject(grade) {
  let url =
    "http://www.yuanfudao.com/tutor-student-lesson/android/channels/all?gradeId=" +
    grade.id +
    "&studyPhase=" +
    grade.phase +
    "&UDID=-5368836907672323593";

  crawler.queue({
    uri: url,
    callback: (err, res, done) => {
      let subjects = JSON.parse(res.body);
      for (var i = 0; i < subjects.length; i++) {
        var subject = subjects[i];
        getHomePage(grade, subject);
      }
    }
  });
}

function getHomePage(grade, subject) {
  let url =
    "http://www.yuanfudao.com/tutor-student-lesson/android/homepage?channelId=" +
    subject.id +
    "&grade=" +
    grade.id;

  crawler.queue({
    uri: url,
    callback: (err, res, done) => {
      let room = JSON.parse(res.body);
      for (var i = 0; i < room.list.length; i++) {
        var lesson = room.list[i];
        getLessonGroup(grade, subject, lesson);
      }
    }
  });
}

function getLessonGroup(grade, subject, lesson) {
  let url =
    "http://www.yuanfudao.com/tutor-student-lesson/android/groups/" +
    lesson.id +
    "/lessons?grade=" +
    grade.id;
  crawler.queue({
    uri: url,
    callback: (err, res, done) => {
      let lessonGroup = JSON.parse(res.body);
      for (var i = 0; i < lessonGroup.list.length; i++) {
        var less = lessonGroup.list[i];
        getComments(grade, subject, lesson, less);
      }
    }
  });
}

function getComments(grade, subject, lesson, less) {
  let url =
    "http://www.yuanfudao.com/tutor-comment/android/lessons/" +
    less.id +
    "/comment-rate";

  crawler.queue({
    uri: url,
    callback: (err, res, done) => {
      let comments = JSON.parse(res.body);
      save(grade, subject, lesson, less, comments);
    }
  });
}
