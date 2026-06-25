function convertTextToObject(input) {
  const objects = [];
  const lines = input.split('Class:').map(line => line.trim());

  for (let i = 1; i < lines.length; i++) {
    const classInfo = lines[i].split('Time:');
    const timeInfo = classInfo[1].split('Location:');
    const locationInfo = timeInfo[1].split('Instructor:');
    const instructorInfo = locationInfo[1];

    const classObj = {
      class: classInfo[0],
      time: timeInfo[0],
      location: locationInfo[0],
      instructor: instructorInfo
    };

    objects.push(classObj);
  }

  return objects;
}


console.log(convertTextToObject(`
Class: البرمجة بلغة جافا Time: 9:30-10:30 Location: B203 Instructor: Dr Muhammad Jazi Bawaana  Class: تصميم وادارة قواعد البيانات Time: 8:30-9:30 Location: A129 Instructor: Hamdi Ahmed Mohamed Al-Omari  Class: تحليل وتصميم الخوارزميات Time: 12:30-1:30 Location: A105 Instructor: Dr.. Hassan Mouidi Al-Sarhan`));
