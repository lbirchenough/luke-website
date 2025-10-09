"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import classes from "./NavBar.module.css";
import { ChevronsRight, FileText, User, House, Wrench } from "lucide-react";


export default function NavBar() {
  const pathname = usePathname();
  return (
    <div className={classes.navbar} data-pdf-hide>
        <ul>
            <li >
                <div className={classes.navLink}>
                    <span><ChevronsRight className={classes.arrow} /></span>
                    {/* <span className={classes.text}>Luke&apos;s Site</span> */}
                </div>
                </li>
                
            {/* <li>
                <Link href="/" className={classes.navLink} >
                    <span><House /></span>
                    <span className={classes.text}>HOME</span>
                </Link>
            </li> */}
            <li>
                <Link href="/about" className={`${classes.navLink} ${pathname === "/about" ? classes.active : ""}`}>
                    <span><User /></span>
                    <span className={classes.text}>ABOUT</span>
                </Link>
            </li>
            <li>
                <Link href="/resume" className={`${classes.navLink} ${pathname === "/resume" ? classes.active : ""}`}>
                    <span><FileText /></span>
                    <span className={classes.text}>RESUME</span>
                </Link>
            </li>
            <li>
                <Link href="/projects" className={`${classes.navLink} ${pathname === "/projects" ? classes.active : ""}`}>
                    <span><Wrench /></span>
                    <span className={classes.text}>PROJECTS</span>
                </Link>
            </li>
        </ul>
    </div>
  );
}