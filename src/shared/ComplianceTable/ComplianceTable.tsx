import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Paper,
    Typography,
    Box,
    IconButton,
} from '@mui/material';
import {
    KeyboardArrowDown as ExpandIcon,
    KeyboardArrowUp as CollapseIcon,
} from '@mui/icons-material';

const ComplianceTable: React.FC = () => {
    // const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set(['parent1']));

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    return (
        <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0', borderRadius: 0 }}>
            <Table sx={{ minWidth: 1000 }}>
                {/* Table Header */}
                <TableRow sx={{ backgroundColor: 'secondary.main' }}>
                    <TableCell sx={{ padding: '12px 16px', fontWeight: 'bold', width: '40%' }}>
                        Items
                    </TableCell>
                    <TableCell sx={{ padding: '12px 16px', fontWeight: 'bold', width: '15%' }}>
                        Due Date
                    </TableCell>
                    <TableCell sx={{ padding: '12px 16px', fontWeight: 'bold', width: '15%' }}>
                        Owner
                    </TableCell>
                    <TableCell sx={{ padding: '12px 16px', fontWeight: 'bold', width: '10%' }}>
                        Attachments
                    </TableCell>
                    <TableCell sx={{ padding: '12px 16px', fontWeight: 'bold', width: '10%' }}>
                        Global
                    </TableCell>
                    <TableCell sx={{ padding: '12px 16px', fontWeight: 'bold', width: '10%' }}>
                        Actions
                    </TableCell>
                </TableRow>

                <TableBody>
                    {/* Header Row */}
                    <TableRow sx={{ backgroundColor: 'secondary.main' }}>
                        <TableCell colSpan={6} sx={{ padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #e0e0e0', cursor: 'pointer' }} onClick={() => toggleRow('parent1')}>

                            Standard Onboarding Items
                            <IconButton
                                size="small"

                                sx={{ padding: 0, marginRight: 1 }}
                            >
                                {expandedRows.has('parent1') ? <CollapseIcon /> : <ExpandIcon />}
                            </IconButton>
                        </TableCell>

                    </TableRow>

                    {expandedRows.has('parent1') && (
                        <>
                            {/* First Item Row */}
                            < TableRow sx={(theme) => ({
                                borderBottom: '1px solid #e0e0e0', cursor: 'pointer',
                                backgroundColor: expandedRows.has('item1') ? theme.customColors.surfaceDark : 'secondary.main'
                            })} onClick={() => toggleRow('item1')}>
                                <TableCell sx={{ padding: '12px 16px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                                        <Typography variant="body2">
                                            National Criminal Background Check
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ padding: '12px 16px' }}></TableCell>
                                <TableCell sx={{ padding: '12px 16px' }}>Vendor</TableCell>
                                <TableCell sx={{ padding: '12px 16px', textAlign: 'center' }}>
                                    {/* <CheckIcon sx={{ fontSize: 18, color: 'green' }} /> */}
                                    N/A
                                </TableCell>
                                <TableCell sx={{ padding: '12px 16px', textAlign: 'center' }}>
                                    {/* <CheckIcon sx={{ fontSize: 18, color: 'green' }} /> */}
                                    N/A
                                </TableCell>
                                <TableCell sx={{ padding: '12px 16px', textAlign: 'center' }} >
                                    <IconButton
                                        size="small"

                                        sx={{ padding: 0, marginRight: 1 }}
                                    >
                                        {expandedRows.has('item1') ? <CollapseIcon /> : <ExpandIcon />}
                                    </IconButton>
                                </TableCell>
                            </TableRow>

                            {/* Expanded Description Row */}
                            {expandedRows.has('item1') && (
                                // <TableRow>
                                <TableRow>

                                    <TableCell colSpan={6} sx={{ padding: '16px', paddingLeft: '0', borderBottom: '0px' }}>
                                        <Box sx={{ pl: 4 }}>
                                            <Typography variant="body2" color="text.main">
                                                National Criminal Background Check required for each selected candidate prior to start.
                                                Needs to be a national check, going back 7-10 years. Existing checks may be used if
                                                completed in last 2-3 months
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Compliance Rules Row */}
                            {expandedRows.has('item1') && (
                                <TableRow >
                                    <TableCell colSpan={6} sx={{ padding: '16px', paddingLeft: '0' }}>
                                        <Box sx={{ pl: 4 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                                                Compliance Values & Rules
                                            </Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, rowGap: 1, width: { md: '95%' } }}>
                                                {/* <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Vendor Can Edit:
                                                    </Typography>
                                                    <Typography variant="body2">Always</Typography>
                                                </Box> */}
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight={600} color="text.main">
                                                        Vendor Can Edit:
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Always
                                                    </Typography>
                                                </Box>


                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Date Achieved:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Conducted Date:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Meets Requirements:
                                                    </Typography>
                                                    <Typography variant="body2">Yes</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Require Review:
                                                    </Typography>
                                                    <Typography variant="body2">Always</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Pass/Fail:
                                                    </Typography>
                                                    <Typography variant="body2">Always</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Certification#:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Comment Field:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Valid Locations:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Expiration Date:
                                                    </Typography>
                                                    <Typography variant="body2">Yes</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Completed Date:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Require Response Attachment:
                                                    </Typography>
                                                    <Typography variant="body2">Optional</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Days Reusable:
                                                    </Typography>
                                                    <Typography variant="body2">0</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Associated Compliance Groups:
                                                    </Typography>
                                                    <Typography variant="body2">1</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>

                            )}

                            <TableRow sx={(theme) => ({
                                borderBottom: '1px solid #e0e0e0', cursor: 'pointer',
                                backgroundColor: expandedRows.has('item2') ? theme.customColors.surfaceDark : 'secondary.main'
                            })} onClick={() => toggleRow('item2')}>
                                <TableCell sx={{ padding: '12px 16px' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                                        <Typography variant="body2">
                                            e-Verify Initial Case Results
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ padding: '12px 16px' }}></TableCell>
                                <TableCell sx={{ padding: '12px 16px' }}>Vendor</TableCell>
                                <TableCell sx={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.main">
                                        No
                                    </Typography>
                                </TableCell>
                                <TableCell sx={{ padding: '12px 16px', textAlign: 'center' }}>
                                    {/* <CheckIcon sx={{ fontSize: 18, color: 'green' }} /> */}
                                    N/A
                                </TableCell>
                                <TableCell sx={{ padding: '12px 16px', textAlign: 'center' }}>
                                    <IconButton
                                        size="small"

                                        sx={{ padding: 0, marginRight: 1 }}
                                    >
                                        {expandedRows.has('item2') ? <CollapseIcon /> : <ExpandIcon />}
                                    </IconButton>
                                </TableCell>
                            </TableRow>

                            {expandedRows.has('item2') && (
                                <TableRow >
                                    <TableCell colSpan={6} sx={{ padding: '16px', paddingLeft: '0', borderBottom: '0px' }}>
                                        {/* <Box sx={{ pl: 4 }} flexDirection={"row"}>
                                            <Typography variant="body2" color="text.main">
                                                Compliance Item Details
                                            </Typography>
                                            <Typography variant="body2" color="text.main" ml={4}>
                                                ID:4636
                                            </Typography>
                                        </Box> */}

                                        <Box sx={{ pl: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }} mb={2}>
                                            <Typography variant="body2" fontWeight={600} color="text.primary">
                                                Compliance Item Details
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ ml: 5 }}>
                                                ID: 4636
                                            </Typography>
                                        </Box>

                                        <Box sx={{ pl: 4, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                            <Typography variant="body2" color="text.primary">
                                                e-Verify date initiated, date completed, & Initial Case Result must be attached after start of engmnt. If you are unable to run e-Verify resource, enter the specific reason in the comment feild
                                            </Typography>
                                        </Box>

                                    </TableCell>
                                </TableRow>
                            )}

                            {/* Compliance Rules Row */}
                            {expandedRows.has('item2') && (
                                <TableRow >
                                    <TableCell colSpan={6} sx={{ padding: '16px', paddingLeft: '0' }}>
                                        <Box sx={{ pl: 4 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                                                Compliance Values & Rules
                                            </Typography>
                                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, rowGap: 1, width: { md: '95%' } }}>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Vendor Can Edit:
                                                    </Typography>
                                                    <Typography variant="body2">Always</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Date Achieved:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Conducted Date:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Meets Requirements:
                                                    </Typography>
                                                    <Typography variant="body2">Yes</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Require Review:
                                                    </Typography>
                                                    <Typography variant="body2">Always</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Pass/Fail:
                                                    </Typography>
                                                    <Typography variant="body2">Always</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Certification#:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Comment Field:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Valid Locations:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Expiration Date:
                                                    </Typography>
                                                    <Typography variant="body2">Yes</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Display Completed Date:
                                                    </Typography>
                                                    <Typography variant="body2">No</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Require Response Attachment:
                                                    </Typography>
                                                    <Typography variant="body2">Optional</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Days Reusable:
                                                    </Typography>
                                                    <Typography variant="body2">0</Typography>
                                                </Box>
                                                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', width: '100%' }}>
                                                    <Typography variant="body2" fontWeight="600" color="text.main">
                                                        Associated Compliance Groups:
                                                    </Typography>
                                                    <Typography variant="body2">1</Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                </TableRow>

                            )}

                        </>
                    )}

                </TableBody>
            </Table>
        </TableContainer >
    );
};

export default ComplianceTable;