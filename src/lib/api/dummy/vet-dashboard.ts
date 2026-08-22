export const getVetDashboard = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    vet: { name: "Dr. Bankey" },
    workload: {
      awaiting_signature: 2,
      unsigned_emergency: 1,
      follow_up: 3,
      stewardship_review: 2,
      status: "action_needed"
    },
    alerts: [
      {
        id: "alert-1",
        farm: "Meena Poultry",
        animal_flock: "Flock P-01",
        drug: "Oxytetracycline",
        administered_at: "09:18",
        badge: "unsigned_emergency"
      },
      {
        id: "alert-2",
        farm: "Shanti Dairy",
        animal_flock: "MP-105",
        drug: "Amoxicillin",
        administered_at: "Yesterday",
        badge: "unsigned_emergency"
      },
      {
        id: "alert-3",
        farm: "Krishna Dairy",
        animal_flock: "MP-118",
        drug: "Enrofloxacin",
        administered_at: "18 Aug",
        badge: "unsigned_emergency"
      }
    ],
    attention_items: [
      {
        id: "attn-1",
        type: "prescription",
        priority_color: "orange",
        label: "Prescription awaiting signature",
        link_text: "Review & Sign \u2192",
        title: "Shanti Dairy \u00b7 MP-104",
        diagnosis: "Clinical mastitis",
        detail: "Amoxicillin \u00b7 administered 10:42",
        badges: [
          { text: "SIGN-REQ", variant: "sign" },
          { text: "ACCESS", variant: "access" }
        ]
      },
      {
        id: "attn-2",
        type: "emergency",
        priority_color: "red",
        label: "Unsigned emergency",
        link_text: "Review & Countersign \u2192",
        title: "Meena Poultry \u00b7 Flock P-01",
        diagnosis: "Gumboro (IBD)",
        detail: "Oxytetracycline \u00b7 administered 09:18",
        badges: [
          { text: "UNSIGNED EMERGENCY", variant: "unsigned_emergency", dot: true }
        ]
      },
      {
        id: "attn-3",
        type: "prescription",
        priority_color: "orange",
        label: "Prescription awaiting signature",
        link_text: "Review & Sign \u2192",
        title: "Krishna Dairy \u00b7 MP-118",
        diagnosis: "Clinical mastitis",
        detail: "Enrofloxacin \u00b7 administered Yesterday",
        badges: [
          { text: "SIGN-REQ", variant: "sign" },
          { text: "WATCH", variant: "watch" },
          { text: "CIA", variant: "cia" }
        ]
      },
      {
        id: "attn-4",
        type: "stewardship",
        priority_color: "purple",
        label: "Stewardship review",
        link_text: "Review \u2192",
        title: "Krishna Dairy \u00b7 MP-118",
        diagnosis: "Clinical mastitis",
        detail: "",
        badges: [
          { text: "WATCH", variant: "watch" },
          { text: "CIA", variant: "cia" }
        ]
      }
    ],
    insights: [
      {
        id: "insight-1",
        type: "treatment_evidence",
        case_title: "Clinical mastitis \u00b7 Buffalo",
        similar_case_count: 47,
        recovery_pct: 82,
        recovery_label: "Recovered or improved",
        disclaimer: "Supporting evidence from recorded cases. Not a recommendation."
      }
    ],
    prescriptions: {
      total: 4,
      items: [
        { rx_id: "Rx-208", farm: "Shanti Dairy", animal_flock: "MP-104", diagnosis: "Clinical mastitis", status_badges: [{ text: "SIGN-REQ", variant: "sign" }], aware_badge: { text: "ACCESS", variant: "access" }, time: "10:42", action_text: "Review \u2192" },
        { rx_id: "Rx-207", farm: "Meena Poultry", animal_flock: "Flock P-01", diagnosis: "Gumboro (IBD)", status_badges: [{ text: "UNSIGNED EMERGENCY", variant: "unsigned_emergency", dot: true }], aware_badge: null, time: "09:18", action_text: "Review \u2192" },
        { rx_id: "Rx-205", farm: "Krishna Dairy", animal_flock: "MP-118", diagnosis: "Clinical mastitis", status_badges: [{ text: "SIGN-REQ", variant: "sign" }, { text: "WATCH", variant: "watch" }], aware_badge: { text: "CIA", variant: "cia" }, time: "Yesterday", action_text: "Review \u2192" },
        { rx_id: "Rx-201", farm: "Shanti Dairy", animal_flock: "MP-101", diagnosis: "Clinical mastitis", status_badges: [{ text: "SIGNED", variant: "signed", dot: true }], aware_badge: { text: "ACCESS", variant: "access" }, time: "Yesterday", action_text: "View \u2192" }
      ]
    },
    recent_activity: [
      { time: "10:42", title: "Rx-208 \u00b7 MP-104", description: "Prescription awaiting signature" },
      { time: "09:18", title: "Flock P-01", description: "Emergency administration recorded" },
      { time: "Yesterday", title: "Rx-201 \u00b7 MP-101", description: "Prescription signed" },
      { time: "Yesterday", title: "MP-101", description: "Treatment outcome recorded" },
      { time: "18 Aug", title: "MP-112", description: "Treatment outcome recorded" },
      { time: "17 Aug", title: "Rx-199 \u00b7 MP-098", description: "Prescription signed" },
      { time: "17 Aug", title: "MP-098", description: "Treatment protocol updated" }
    ],
    recent_outcomes: [
      { animal_flock: "MP-101", diagnosis: "Clinical mastitis", detail: "Treatment completed \u00b7 18 Aug", outcome_badge: { text: "RECOVERED", variant: "recovered" } },
      { animal_flock: "MP-112", diagnosis: "Mastitis", detail: "Treatment completed \u00b7 17 Aug", outcome_badge: { text: "IMPROVED", variant: "improved" } },
      { animal_flock: "Flock P-01", diagnosis: "Gumboro (IBD)", detail: "", outcome_badge: { text: "FOLLOW-UP PENDING", variant: "follow_up_pending" } },
      { animal_flock: "MP-095", diagnosis: "Lameness", detail: "Treatment completed \u00b7 16 Aug", outcome_badge: { text: "RECOVERED", variant: "recovered" } },
      { animal_flock: "MP-088", diagnosis: "Pneumonia", detail: "Treatment completed \u00b7 15 Aug", outcome_badge: { text: "FAILED", variant: "failed" } },
      { animal_flock: "Flock P-03", diagnosis: "Coccidiosis", detail: "Treatment completed \u00b7 14 Aug", outcome_badge: { text: "IMPROVED", variant: "improved" } }
    ]
  };
};
