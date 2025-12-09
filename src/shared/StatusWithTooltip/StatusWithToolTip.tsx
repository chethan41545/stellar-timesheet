import { Typography, Tooltip } from "@mui/material";
import { getStatusBadgeConfig } from "../Styles/CommonStyles";

type Props = {
    status: string;
};

export function StatusWithTooltip({ status }: Props) {

    const statusConfig = getStatusBadgeConfig(status);

    const isTruncated = statusConfig.truncate;
    const style = statusConfig.styles;

    const textElement = (
        <Typography
            variant="body1"
            fontWeight={500}
            mr={2}
            sx={{ ...style }}
        >
            {status}
        </Typography>
    );

    return isTruncated ? (
        <Tooltip title={status} arrow>
            {textElement}
        </Tooltip>
    ) : (
        textElement
    );
}
