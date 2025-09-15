
import Link from "next/link";
import classes from "./NavBar.module.css";
import { ChevronsRight, FileText, User, House } from "lucide-react";


export default function NavBar() {
  return (
    <div className={classes.navbar} data-pdf-hide>
        <ul>
            <li >
                <div className={classes.navLink}>
                    <span><ChevronsRight className={classes.arrow} /></span>
                    {/* <span className={classes.text}>Luke&apos;s Site</span> */}
                </div>
                </li>
                
            <li>
                <Link href="/" className={classes.navLink} >
                    <span><House /></span>
                    <span className={classes.text}>HOME</span>
                </Link>
            </li>
            <li>
                <Link href="/about" className={`${classes.navLink} font-semibold text-blue-400`}>
                    <span><User /></span>
                    <span className={classes.text}>ABOUT</span>
                </Link>
            </li>
            <li>
                <Link href="/resume" className={classes.navLink}>
                    <span><FileText /></span>
                    <span className={classes.text}>RESUME</span>
                </Link>
            </li>
        </ul>
    </div>
  );
}