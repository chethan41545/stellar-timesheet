import { useState } from "react";
import {
    Grid,
} from "@mui/material";

import styles from "./ReportsTab.module.css";
import WeeklyReports from "./WeeklyReports";
import TimesheetList from "./TimesheetList";



const ReportTab = () => {

    const [active, setActive] = useState("timesheet");

    const tabs = [
        { key: "timesheet", label: "Timesheet Report" },
        { key: "weekly", label: "Weekly Report" },        
        { key: "approvalAudit", label: "Approval audit report" },
    ];

    return (
        <Grid container>
            <div className={styles.tabsBar} role="tablist">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        role="tab"
                        aria-selected={active === t.key}
                        className={`${styles.tab} ${active === t.key ? styles.active : ""}`}
                        onClick={() => setActive(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <Grid sx={{width:"100%"}}>
                {active === "weekly" && <WeeklyReports />}
                {active === "timesheet" && <TimesheetList />}

            </Grid>
        </Grid>
    );
};

export default ReportTab;