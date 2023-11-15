import React, { useState, useEffect } from "react";
import { CalendarEvent, getCalendarEvents } from "../api-client";
import styled, { keyframes } from "styled-components";

const Container = styled.div`
  margin-bottom: 20px;
`;

const Table = styled.table`
  border-collapse: collapse;
  width: 100%;
`;

const TableHeader = styled.th`
  background: #f2f2f2;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
`;

const TableCell = styled.td`
  padding: 8px;
  border: 1px solid #ddd;
  text-align: left;
`;

const BoldTableCell = styled(TableCell)`
  font-weight: bold;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
`;

const spinAnimation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: ${spinAnimation} 1s linear infinite;
`;

// for optimization, I could use useMemo for functions calculating events
// so that they would not be run again during rendering.
// Also can make hook for fetching data

const CalendarSummary: React.FunctionComponent = () => {
  const [events, setEvents] = useState<{ [key: string]: CalendarEvent[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentDay = new Date();
      const promises = [];

      for (let i = 0; i < 7; i++) {
        const nextDay = new Date(currentDay);
        nextDay.setDate(currentDay.getDate() + i);
        promises.push(getCalendarEvents(nextDay));
      }

      const eventsDataArray = await Promise.all(promises);

      const eventsData: { [key: string]: CalendarEvent[] } = {};
      eventsDataArray.forEach((eventsOfDay, index) => {
        const date = new Date(currentDay);
        date.setDate(currentDay.getDate() + index);
        eventsData[date.toISOString().split("T")[0]] = eventsOfDay;
      });

      setEvents(eventsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      setLoading(false);
    }
  };

  const calculateTotalDuration = (day: string): number => {
    const eventsOfDay = events[day] || [];

    return eventsOfDay.reduce(
      (total: number, event: { durationInMinutes: number }) =>
        total + event.durationInMinutes,
      0
    );
  };

  const findLongestEvent = (day: string) => {
    const eventsOfDay = events[day] || [];

    const longestEvent = eventsOfDay.reduce(
      (max: any, event: { durationInMinutes: number }) =>
        event.durationInMinutes > max.durationInMinutes ? event : max,
      { durationInMinutes: 0 }
    );

    return longestEvent;
  };

  return (
    <Container>
      <h2>Calendar summary</h2>
      {loading ? (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      ) : (
        <Table>
          <thead>
            <TableRow>
              <TableHeader>Date</TableHeader>
              <TableHeader>Number of events</TableHeader>
              <TableHeader>Total duration [min]</TableHeader>
              <TableHeader>Longest event</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {Object.keys(events).map((day) => (
              <TableRow key={day}>
                <TableCell>{day}</TableCell>
                <TableCell>{events[day].length}</TableCell>
                <TableCell>{calculateTotalDuration(day)}</TableCell>
                <TableCell>{findLongestEvent(day).title}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <BoldTableCell>Total</BoldTableCell>
              <BoldTableCell>
                {Object.values(events).reduce(
                  (total, eventsOfDay) => total + eventsOfDay.length,
                  0
                )}
              </BoldTableCell>
              <BoldTableCell>
                {Object.keys(events).reduce(
                  (total, day) => total + calculateTotalDuration(day),
                  0
                )}
              </BoldTableCell>
              <BoldTableCell>
                {findLongestEvent(Object.keys(events)[0]).title}
              </BoldTableCell>
            </TableRow>
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default CalendarSummary;
