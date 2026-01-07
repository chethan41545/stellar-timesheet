import { useState } from "react";
import {
    Grid,
} from "@mui/material";

import styles from "./ReportsTab.module.css";
import WeeklyReports from "./WeeklyReports";



const ReportTab = () => {

    const [active, setActive] = useState("weekly");

    const tabs = [
        { key: "weekly", label: "Weekly Report" },
        { key: "timesheet", label: "Timesheet Report" },
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

            </Grid>
        </Grid>
    );
};

export default ReportTab;