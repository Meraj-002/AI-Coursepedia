// import Image from "next/image";
// import { Button } from "@/components/ui/button"
// import {UserButton} from "@clerk/nextjs"

// export default function Home() {
//   return (
//     <div> 
//       <h2>Hello</h2>
//       <Button variant="outline">Button</Button>
//       <UserButton />
//     </div>
//   );
// }
"use client"
import React from "react";
import WelcomeBanner from "./Workspace/_components/WelcomeBanner";
import CourseList from "./Workspace/_components/CourseList";
import AddNewCourseDialog from "./Workspace/_components/AddNewCourseDialogue";
import EnrollCourseList from "./Workspace/_components/EnrollCourseList";
import AppHeader from "./workspace/_components/AppHeader";
import AppSidebar from "./workspace/_components/AppSidebar";
import WorkspaceProvider from "./workspace/provider";

function Workspace() {
    return(
        <div> 
          <WorkspaceProvider>
          <WelcomeBanner /> 
        <EnrollCourseList />
        <CourseList />
        </WorkspaceProvider >
        </div>
    )
}

export default Workspace

