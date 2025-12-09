
export const customCard = {
    background: '#fff',
    border: '1px solid #e5edf9',
    borderRadius: '12px',
    padding: '16px'
};



export const customScrollbar = {
    '&::-webkit-scrollbar': {
        width: '4px',
        height: '4px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#f1f1f1',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: '#c7c6c6ff',
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        backgroundColor: '#555',
    },
};


export const getStatusBadgeConfig = (status: string) => {

    const commonStyles = {
        padding: "4px 10px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        width: {xs:'120px', md:'80px'},
        textAlign:'center'
    }


    switch (status.trim()) {
        case "Active":
            return {
                truncate: false,
                styles: {
                    backgroundColor: "#D6FFD9",
                    color: "black",
                    borderRadius: "20px",
                    ...commonStyles
                }

            };
        case "Closing Soon":
            return {
                truncate: true,
                styles: {
                    backgroundColor: "#FB8C00",
                    color: "white",
                    borderRadius: "20px",
                    ...commonStyles
                }

            };
        case "Interview Scheduled":
            return {
                truncate: true,
                styles: {
                    backgroundColor: "#6F69E4",
                    color: "white",
                    borderRadius: "20px",
                    ...commonStyles
                }

            };

        case "Draft":
            return {
                truncate: true,
                styles: {
                    backgroundColor: "#dd943bff",
                    color: "white",
                    borderRadius: "20px",
                    ...commonStyles
                }

            };

        case "On Hold":
            return {
                truncate: true,
                styles: {
                    backgroundColor: "#dd3b3bff",
                    color: "white",
                    borderRadius: "20px",
                    ...commonStyles
                }

            };

        case "Pending Approval":
            return {
                truncate: true,
                styles: {
                    backgroundColor: "#3d91b8ff",
                    color: "white",
                    borderRadius: "20px",
                    ...commonStyles
                }

            };


        default:
            return {};
    }
};