// import { NextResponse } from 'next/server';
// import { ai } from '../generate-course-layout/route';

// const PROMPT = `Depends on Chapter name and Topic Generate content for each topic in HTML and give response in JSON format.
// Schema:{
//     chapterName:<>,
//     {
//         topic:<>,
//         content:<>

//     }
// }
// : User Input :
// `

// export async function POST(req) {
//     const { courseJson, courseTitle, courseId } = await req.json();

//     const promises = courseJson?.chapters?.map(async (chapter) => {

        
//         const config = {
//             responseMimeType : 'text/plain',
//         };
//         const model = 'gemini-2.0-flash';
//         const contents = [
//             {
//                 role: 'user',
//                 parts: [
//                     {
//                         text: PROMPT+JSON.stringify(chapter),
//                     },
//                 ],
//             },
//         ];

//         const response = await ai.models.generateContent({
//             model,
//             config,
//             contents,
//         });

//         console.log(response.candidates[0].content.parts[0].text);
//         const RawResp = response?.candidates[0]?.content?.parts[0]?.text
//         const RawJson = RawResp.replace('```json', '').replace('```', '');
//         const JSONResp = JSON.parse(RawJson);
        

//         // Get Youtube Videos
//         return JSONResp;

//     })

//     const CourseContent= await Promise.all(promises)

//     return NextResponse.json({
//         courseName:courseTitle,
//         CourseContent:CourseContent
//     })
// }

import { NextResponse } from 'next/server';
import { ai } from '../generate-course-layout/route';
import axios from 'axios';
import { coursesTable } from '@/config/schema';
import { db } from "@/config/db";
import { eq } from "drizzle-orm"

const PROMPT = `
Generate HTML content for each topic based on the chapter name and topic.
Return strictly valid JSON only. Do not wrap it in markdown code blocks or backticks.
:
{
  "chapterName": "Chapter Title",
  "topics": [
    {
      "topic": "Topic Title",
      "content": "<p>HTML content...</p>"
    }
  ]
}
Do not include markdown like \`\`\`json.
User Input:
`;

export async function POST(req) {
    const { courseJson, courseTitle, courseId } = await req.json();

    const promises = courseJson?.chapters?.map(async (chapter) => {
        const config = {
            responseMimeType: 'text/plain',
        };
        const model = 'gemini-1.5-flash';
        const contents = [
            {
                role: 'user',
                parts: [
                    {
                        text: PROMPT + JSON.stringify(chapter),
                    },
                ],
            },
        ];

        const generateContentWithRetry = async (model, config, contents, retries = 3) => {
            for (let attempt = 0; attempt < retries; attempt++) {
                try {
                    return await ai.models.generateContent({ model, config, contents });
                } catch (err) {
                    if (err?.error?.code === 503 && attempt < retries - 1) {
                        console.warn(`⚠️ Gemini is overloaded. Retrying... (${attempt + 1})`);
                        await new Promise(res => setTimeout(res, 2000)); // wait 2 seconds
                    } else {
                        console.error("❌ Gemini API failed:", err.message);
                        throw err;
                    }
                }
            }
        };
        
        const response = await generateContentWithRetry(model, config, contents);


        // const response = await ai.models.generateContent({
        //     model,
        //     config,
        //     contents,
        // });

        const RawResp = response?.candidates[0]?.content?.parts[0]?.text || '';
        let JSONResp;

        // try {
        //     const RawJson = RawResp
        //         .replace(/```json\s*/i, '')
        //         .replace(/```$/, '')
        //         .trim();
        //     JSONResp = JSON.parse(RawJson);
        // } catch (err) {
        //     console.error("❌ JSON parsing failed:", err.message);
        //     console.log("❓ AI Output:", RawResp);
        //     throw new Error("AI response was not valid JSON.");
        // }

try {
  const RawJson = RawResp
    .replace(/^\s*```json\s*/i, '')   // remove ```json if present
    .replace(/^\s*```\s*/i, '')       // remove ``` if just triple backtick
    .replace(/```\s*$/i, '')          // remove ending ```
    .trim();

  JSONResp = JSON.parse(RawJson);
} catch (err) {
  console.error("❌ JSON parsing failed:", err.message);
  console.log("❓ AI Output:", RawResp);
  throw new Error("AI response was not valid JSON.");
}



        // Get Yutube Video

        const youtubeData=await GetYoutubeVideo(chapter?.chapterName);
        console.log({
            youtubeVideo:youtubeData,
            courseData:JSONResp
        })
        return{
            youtubeVideo:youtubeData,
            courseData:JSONResp
        }
    });

    const CourseContent = await Promise.all(promises);

    // Save toi DB
    const dbResp=await db.update(coursesTable).set({
        courseContent:CourseContent
    }).where(eq(coursesTable.cid,courseId));

    return NextResponse.json({
        courseName: courseTitle,
        CourseContent,
    });
}

const YOUTUBE_BASE_URL='https://www.googleapis.com/youtube/v3/search'
const GetYoutubeVideo=async(topic)=>{
    const params={
        part:'snippet',
        q:topic,
        maxResults:4,
        type:'video',
        key: process.env.YOUTUBE_API_KEY
    }

    const resp=await axios.get(YOUTUBE_BASE_URL,{params});
    const youtubeVideoListResp= resp.data.items;
    const youtubeVideoList=[];
    youtubeVideoListResp.forEach(item=>{
        const data={
            videoId:item.id?.videoId,
            title:item?.snippet?.title
        }
        youtubeVideoList.push(data);
    })

    console.log('youtubeVideoList',youtubeVideoList);
    return youtubeVideoList; 
}
