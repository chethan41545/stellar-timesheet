import { Box, Grid, Typography } from "@mui/material";
import AnnouncementsList from "./AnnouncementsList";
import { customCard, customScrollbar } from "../../shared/Styles/CommonStyles";
import HolidayScreen from "./HolidayList";



const Dashboard = () => {
    return (
        <Box >
            <Grid container>

                {/* <Grid size={{ xs: 12 }}>
                    <HolidayScreen />
                </Grid> */}

                <Grid size={{ xs: 5 }}>
                    <Grid size={{ xs: 12 }} >
                        <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                            Announcements
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12 }} sx={{ height: "300px", overflowY: "auto", ...customScrollbar, ...customCard }}>
                        <AnnouncementsList />
                    </Grid>
                </Grid>



            </Grid>
        </Box>
    )
}

export default Dashboard;