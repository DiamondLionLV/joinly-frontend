'use client'

import { useState, useEffect } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import Image from 'next/image';

import joinly from '../assets/joinly.png';

dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyAhi2xnOblRCLkkhEPrQXhmRhUMW4wYlNk",
  authDomain: "joinly-1eb05.firebaseapp.com",
  projectId: "joinly-1eb05",
  storageBucket: "joinly-1eb05.appspot.com",
  messagingSenderId: "1087893992605",
  appId: "1:1087893992605:web:133069cce64f7ed4939074",
  measurementId: "G-KB6MTZ5X3L"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export const SDKUsageDemo = () => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showInput, setShowInput] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [showInitialMessage, setShowInitialMessage] = useState(true);
  const [isSubmited, setIsSubmited] = useState(false);
  const [notificationDisplayed, setNotificationDisplayed] = useState(false);

  const handleInputChange = (event) => {
    setUserAnswer(event.target.value);
  };

  useEffect(() => {
    let timer;

    const saveUserIdToDB = async () => {
      try {
        const userId = await identify();
        console.log('User ID:', userId);

        const docRef = doc(firestore, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          await setDoc(docRef, {
            userId: userId,
            isNotificationTime: false,
            isSubmited: false,
          });

          console.log('Document successfully written!');
        } else {
          console.log('Document already exists.');
        }
      } catch (error) {
        console.error('Error saving user ID to DB:', error);
      }
    };

    saveUserIdToDB();

    const getUserQuestion = async () => {
      const userId = await identify();

      const docRef = doc(firestore, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userDoc = docSnap.data();
        console.log('User doc:', userDoc);
        const question = userDoc.randomQuestion


        setCurrentQuestion(question);

        return;
      }
    }

    const startTimer = async () => {
        try {
          const userId = await identify();
          const docRef = doc(firestore, 'users', userId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userDoc = docSnap.data();
            const userIsNotificationTime = userDoc.isNotificationTime || false;

            if (userIsNotificationTime && !notificationDisplayed) {
              miro.board.notifications.showInfo(miroNotif);
              if (!currentQuestion) {
                getUserQuestion();
                setShowInitialMessage(false);
              }
              setShowInput(true);
              setNotificationDisplayed(true);
            }
          }
        } catch (error) {
          console.error('Error checking notification time:', error);
        }
    };

    startTimer();

    return () => {
      clearTimeout(timer);
    };
  }, [currentQuestion, notificationDisplayed]);

  const handleSubmit = async (currentQuestion) => {
    if (userAnswer.trim() !== '') {
      try {
        const userId = await identify();
        const docRef = doc(firestore, 'users', userId);

        await updateDoc(docRef, {
          isSubmited: true,
          isNotificationTime: false,
        });

        setIsSubmited(true);

        addStickyWithAnswer(userAnswer, currentQuestion);

        setUserAnswer('');
        setShowInput(false);
      } catch (error) {
        console.error('Error updating document:', error);
      }
    }
  };

  return (
    <div>
      {showInitialMessage && !isSubmited && (
        <div>
          <p>Your MiReal hasn't yet started today</p>
        </div>
      )}

      {isSubmited && (
        <div>
          <p>You have already submitted your answer today.</p>
          <button
            type="button"
            onClick={() => zoomToFrame()}
            className="button button-primary"
          >
            Zoom to Answer
          </button>
        </div>
        
      )}

      {showInput && (
        <div>
          {/* <div className='cs1 cel12'>
            <Image src={joinly} width={400} height={400} alt="Join.ly logo" />
          </div> */}
          <p>{currentQuestion}</p>
          <input
            type="text"
            value={userAnswer}
            onChange={handleInputChange}
            placeholder="Type your answer..."
            className="input"
          />
          <p></p>
          <button
            type="button"
            onClick={() => handleSubmit(currentQuestion)}
            className="button button-primary"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

const miroNotifMessage = {
  action: "⚠️ Time to answer your MiReal! ⚠️",
};

const miroNotif = `${miroNotifMessage.action}`;

// Declare the frame variable in the global scope
let frame;

const zoomToFrame = async () => {
  await miro.board.viewport.zoomTo(frame);
}

async function addStickyWithAnswer(answer, question) {
  try {
    // Check if the frame with the specific question already exists
    // const existingFrame = (await miro.board.widgets.create({
    //   type: 'FRAME',
    //   text: question,
    // }))[0];

    // If the frame doesn't exist, create a new frame
    // if (!existingFrame) {
    const position = await miro.board.experimental.findEmptySpace({
      x: 0,
      y: 0,
      width: 3000,
      height: 3000,
    })

    if (!frame) {
      // Create a new frame
      frame = await miro.board.createFrame({
        title: question,
        style: {
          fillColor: '#fff',
        },
        width: 200,
        height: 200,
        x: position.x,
        y: position.y,
      });
      console.log('Frame:', frame);

      // Add sticky inside the new frame
      const stickyNote = await frame.add(await miro.board.createStickyNote({
        content: answer,
        style: {
          fillColor: 'dark_blue',
          textAlign: 'center',
          textAlignVertical: 'middle',
        },
        x: frame.x, // Adjust the position as needed
        y: frame.y, // Adjust the position as needed
        shape: 'square',
        width: 130,
      }));

      // await miro.board.viewport.zoomTo(frame);
    } else {
      // If the frame already exists, add sticky inside it
      const stickyNote = await frame.add(await miro.board.createStickyNote({
        content: answer,
        style: {
          fillColor: 'dark_blue',
          textAlign: 'center',
          textAlignVertical: 'middle',
        },
        x: frame.x + 20, // Adjust the position as needed
        y: frame.y + 20, // Adjust the position as needed
        shape: 'square',
        width: 30,
      }));
    }
  } catch (error) {
    console.error('Error adding sticky with answer:', error);
  }
}



async function identify() {
  let user_id;
  await miro.board.getUserInfo()
    .then(res => user_id = res.id);
  return user_id;
}
