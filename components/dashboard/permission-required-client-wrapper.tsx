"use client";
import PermissionRequiredClient from "./permission-required-client";

export default function PermissionRequiredClientWrapper(props: any) {
  return <PermissionRequiredClient {...props} />;
} 