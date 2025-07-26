"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  Font,
} from "@react-pdf/renderer";
import { useLocalStorage } from "@/lib/storage";
import { TrainingPlan } from "@/lib/planGenerator";

// Register fonts
Font.register({
  family: "Oswald",
  src: "https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf",
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#E4E4E4",
    padding: 30,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    fontFamily: "Oswald",
    marginBottom: 20,
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "12.5%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    backgroundColor: "#374151",
    color: "white",
    padding: 5,
    textAlign: "center",
    fontSize: 10,
  },
  tableCol: {
    width: "12.5%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    textAlign: "center",
    fontSize: 10,
  },
  cell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
  },
});

const PdfDocument = ({ plan }: { plan: TrainingPlan }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Your Training Plan</Text>
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableColHeader}><Text>Week</Text></View>
          <View style={styles.tableColHeader}><Text>Mon</Text></View>
          <View style={styles.tableColHeader}><Text>Tue</Text></View>
          <View style={styles.tableColHeader}><Text>Wed</Text></View>
          <View style={styles.tableColHeader}><Text>Thu</Text></View>
          <View style={styles.tableColHeader}><Text>Fri</Text></View>
          <View style={styles.tableColHeader}><Text>Sat</Text></View>
          <View style={styles.tableColHeader}><Text>Sun</Text></View>
        </View>
        {plan.weeks.map((week) => (
          <View style={styles.tableRow} key={week.week}>
            <View style={styles.tableCol}><Text>{week.week}</Text></View>
            {Object.values(week.days).map((day, index) => (
              <View style={styles.tableCol} key={index}>
                <Text style={styles.cell}>
                  {day ? `${day.type} ${day.distance || ""}` : "Rest"}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default function PdfPreviewPage() {
  const [plan] = useLocalStorage<TrainingPlan | null>("training-plan", null);

  if (!plan) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Text>No plan found. Please generate a plan first.</Text>
      </div>
    );
  }

  return (
    <PDFViewer style={{ width: "100%", height: "100vh" }}>
      <PdfDocument plan={plan} />
    </PDFViewer>
  );
}
