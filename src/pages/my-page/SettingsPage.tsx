import { useQueryClient } from "@tanstack/react-query";

import { getUserIdFromToken } from "@/services/auth";

import { Toast } from "@/store/shared/toast/toast.store";

import { queryKeys } from "@/queries/keys";
import { useGetUserConsents } from "@/queries/user/useGetUserConsents";
import { usePatchUserConsents } from "@/queries/user/usePatchUserConsents";

import { LoadingIndicator } from "@/components/shared/loading";
import { Switch } from "@/components/shared/switch";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const userId = getUserIdFromToken();
  const { data: consents, isLoading } = useGetUserConsents();
  const { mutate: patchConsents } = usePatchUserConsents();

  if (isLoading || !consents) {
    return (
      <div className="flex min-h-[200px] items-center justify-center px-4">
        <LoadingIndicator />
      </div>
    );
  }

  const consentsQueryKey = queryKeys.user.consents(userId);

  const handleLocationChange = (checked: boolean) => {
    const previousConsents = queryClient.getQueryData<typeof consents>(
      consentsQueryKey
    );

    queryClient.setQueryData(consentsQueryKey, {
      ...consents,
      locationAllowed: checked,
    });

    patchConsents(
      {
        locationAllowed: checked,
        notificationAllowed: consents.notificationAllowed,
      },
      {
        onError: () => {
          queryClient.setQueryData(consentsQueryKey, previousConsents);
          Toast.show({ message: "설정 저장에 실패했어요", type: "error" });
        },
      }
    );
  };

  const handleNotificationChange = (checked: boolean) => {
    const previousConsents = queryClient.getQueryData<typeof consents>(
      consentsQueryKey
    );

    queryClient.setQueryData(consentsQueryKey, {
      ...consents,
      notificationAllowed: checked,
    });

    patchConsents(
      {
        locationAllowed: consents.locationAllowed,
        notificationAllowed: checked,
      },
      {
        onError: () => {
          queryClient.setQueryData(consentsQueryKey, previousConsents);
          Toast.show({ message: "설정 저장에 실패했어요", type: "error" });
        },
      }
    );
  };

  return (
    <div className="flex flex-col">
      <div className="overflow-hidden border-gray-100 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <p className="text-body-1 font-medium text-gray-900">
            앱 실행시 현위치 탐색
          </p>
          <Switch
            checked={consents.locationAllowed}
            onChange={(e) => handleLocationChange(e.target.checked)}
          />
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-body-1 font-medium text-gray-900">알림</p>
            <p className="mt-0.5 text-label-1 text-gray-500">
              서비스 공지 및 중요한 정보 수신 알림
            </p>
          </div>
          <Switch
            checked={consents.notificationAllowed}
            onChange={(e) => handleNotificationChange(e.target.checked)}
          />
        </div>
      </div>
    </div>
  );
}
