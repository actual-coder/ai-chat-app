import { ProfileFormData } from "@/lib/zod";
import { api } from "..";
import { getAxiosErrorMessage } from "../utils";
import { ChangePhoto, FetchAnalytis, UpdateProfile } from "./types";

const updateProfile = async ({
  payload,
  token,
}: {
  payload: ProfileFormData;
  token?: string;
}) => {
  try {
    const { data } = await api.put<UpdateProfile>(
      "/users/profile/edit",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
};

const changePhoto = async ({
  ext,
  token,
  type,
}: {
  ext: string;
  token?: string;
  type: string;
}) => {
  try {
    const { data } = await api.put<ChangePhoto>(
      "/users/profile/photo",
      { type, ext },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
};

const fetchAnalytics = async (token?: string) => {
  try {
    const { data } = await api.get<FetchAnalytis>("/users/analytics", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return data;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error));
  }
};

export { updateProfile, changePhoto, fetchAnalytics };
