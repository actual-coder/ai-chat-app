import { Redirect } from "expo-router";
import React from "react";

export default function Index() {
  return (
    <Redirect
      href={{ pathname: "/conversation/[id]", params: { id: "new" } }}
    />
  );
}
