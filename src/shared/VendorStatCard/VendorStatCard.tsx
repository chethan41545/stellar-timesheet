import styles from './VendorStatCard.module.css';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { FiTrendingDown, FiTrendingUp } from "react-icons/fi";
import type { JSX } from 'react';

import fileSvg from "../../assets/dashboard/file.svg";
import pendingActionsSvg from "../../assets/dashboard/pending-actions.svg";
import questionsSvg from "../../assets/dashboard/questions.svg";


type IconKey = 'user' | 'bell' | 'briefcase';
type Direction = 'up' | 'down';

type Props = {
    title: string;
    count: number;
    changePct: number;
    direction: Direction;
    icon: IconKey;
    subtitle?: string;
    accent?: 'green' | 'blue' | 'orange';
    showChart?: boolean;
    chartData?: { value: number, date: string }[];
};

const icons: Record<IconKey, JSX.Element> = {
    user: <img src={fileSvg} alt="User" style={{ width: 20, height: 20 }} />,
    bell: <img src={questionsSvg} alt="Notifications" style={{ width: 24, height: 24 }} />,
    briefcase: <img src={pendingActionsSvg} alt="Briefcase" style={{ width: 24, height: 24 }} />,
};


const ACCENT = {
    green: { stroke: '#268B2A', fill: '#268B2A00', badge: 'rgb(218 235 219)' },
    blue: { stroke: '#3949AB', fill: '#1976D200', badge: 'rgb(220 222 240)' },
    orange: { stroke: '#FF9066', fill: '#FFDED100', badge: '#ffeee8' },
};

const StatCard = ({
    title,
    count,
    changePct,
    direction,
    icon,
    subtitle = 'Up from last month',
    accent = 'green',
    showChart = true,
    chartData,
}: Props) => {
    const isDown = direction === 'down';
    const colors = ACCENT[accent];
    const gradId = `grad-${title.replace(/\s+/g, '-')}`;

    return (
        <div className={styles.card}>
            <div className={styles.topRow}>
                <div className={styles.title}>{title}</div>
                <div className={styles.cornerIcon} style={{ background: colors.badge }}>
                    {icons[icon]}
                </div>
            </div>

            <h3 className={styles.count}>{count}</h3>

            <div className={styles.metricRow}>
                <span className={isDown ? styles.down : styles.up}>
                    {isDown ? <FiTrendingDown style={{ color: '#D80000', fontSize: '20px' }} /> : <FiTrendingUp style={{ color: '#268B2A', fontSize: '20px' }} />} {changePct}%
                </span>
                <p className={styles.subtext}>
                    {isDown ? 'Down from last month' : subtitle}
                </p>
            </div>

            {showChart && (
                <div className={styles.chart}>
                    <ResponsiveContainer width="100%" height={50}>
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.4} />
                                    <stop offset="100%" stopColor={colors.stroke} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis hide dataKey="date" />
                            <YAxis hide domain={['dataMin-1', 'dataMax+1']} />

                            <Tooltip
                                formatter={(value: number) => [`${value}`]}
                                labelFormatter={(date: string) => `${date}`}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '5px',
                                    fontSize: '12px',
                                }}
                                cursor={{ strokeWidth: 0 }}
                            />

                            <Area
                                type="linear"
                                dataKey="value"
                                stroke={colors.stroke}
                                strokeWidth={2}
                                fill={`url(#${gradId})`}
                                isAnimationActive={false}
                            />

                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default StatCard;
