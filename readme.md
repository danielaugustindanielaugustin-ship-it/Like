# College Q&A Application

This is a Node.js application that provides a question-and-answer system for college-related inquiries. It utilizes natural language processing (NLP) to understand and respond to user queries. The application supports various types of questions related to navigation, student information, professor availability, area marking, and charts. It communicates with clients via WebSocket, allowing real-time interaction.

## Installation

1. Clone the repository: `git clone https://github.com/your/repo.git`
2. Navigate to the project directory: `cd project-directory`
3. Install dependencies: `npm install`

## Usage

1. Start the server: `node index.js`
2. Connect to the server using a WebSocket client.
3. Ask questions by sending text messages to the server using the WebSocket connection.

## Supported Questions

### Navigation

1. Where is the library?
2. Where is the cafeteria?
3. Which building is the Algorithms building?
4. Can you show me where I can eat food?

### Student Questions

1. What classes should I have for my first semester as a computer science student?
2. What programming language is taught in the class Intro to Programming?

### Schedule

1. **Class:** البرمجة بلغة جافا (Java Programming)
   **Time:** 9:30-10:30
   **Location:** B203
   **Instructor:** Dr. Muhammad Jazi Bawaana

2. **Class:** تصميم وادارة قواعد البيانات (Database Design and Management)
   **Time:** 8:30-9:30
   **Location:** A129
   **Instructor:** Hamdi Ahmed Mohamed Al-Omari

3. **Class:** تحليل وتصميم الخوارزميات (Algorithm Analysis and Design)
   **Time:** 12:30-1:30
   **Location:** A105
   **Instructor:** Dr. Hassan Mouidi Al-Sarhan

### Professor Questions

1. Where can I find Dr. Hasan between 10:30 and 11:30?
2. Where can I find Dr. Hasan between 11:30 and 12:30?
3. Where can I find Dr. Hasan between 12:30 and 1:30?

### Area Draw

1. Mark the area where Dr. Hasan will be today.
2. Draw me the area where Dr. Hasan is most likely to be today.

### Charts

1. Make a chart about the female-male distribution.
2. Make a chart on top of the main building showing the student year distribution.
3. Make a chart on top of the main building showing the day student density.

Feel free to explore the application by asking questions in the supported formats. The application will process your queries and provide relevant answers.

## License

This project is licensed under the [MIT License](LICENSE).
