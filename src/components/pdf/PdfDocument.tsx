"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { TrainingPlan, Day } from "@/lib/planGenerator";

// Register fonts
Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "white",
    padding: 30,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    fontFamily: "Oswald",
    marginBottom: 20,
    color: "#111827",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "11%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f3f4f6",
    padding: 5,
  },
  tableColHeaderWeek: {
    width: "13%",
     borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f3f4f6",
    padding: 5,
  },
  tableColHeaderTotal: {
    width: "14%",
     borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#f3f4f6",
    padding: 5,
  },
  headerText: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
  },
  tableCol: {
    width: "11%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColWeek: {
    width: "13%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableColTotal: {
    width: "14%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  cellText: {
    textAlign: "center",
    fontSize: 9,
  },
  runType: {
    fontSize: 8,
    color: "#6b7280",
  },
});

const days: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const PdfDocument = ({ plan }: { plan: TrainingPlan }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Your Training Plan</Text>
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableRow}>
          <View style={styles.tableColHeaderWeek}><Text style={styles.headerText}>Week</Text></View>
          {days.map(day => <View key={day} style={styles.tableColHeader}><Text style={styles.headerText}>{day}</Text></View>)}
          <View style={styles.tableColHeaderTotal}><Text style={styles.headerText}>Total (KM)</Text></View>
        </View>
        {/* Body */}
        {plan.weeks.map((week) => (
          <View style={styles.tableRow} key={week.week}>
            <View style={styles.tableColWeek}><Text style={styles.cellText}>{week.week}</Text></View>
            {days.map(day => {
              const run = week.days[day];
              return (
                <View style={styles.tableCol} key={day}>
                  {run ? (
                    <>
                      <Text style={styles.cellText}>{run.distance || "0"}km</Text>
                      <Text style={styles.runType}>{run.type}</Text>
                    </>
                  ) : (
                    <Text style={styles.cellText}>Rest</Text>
                  )}
                </View>
              )
            })}
            <View style={styles.tableColTotal}><Text style={styles.cellText}>{week.weeklyTotal}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
