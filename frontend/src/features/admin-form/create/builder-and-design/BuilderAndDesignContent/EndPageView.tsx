import { useMemo } from 'react'
import { Box, Flex, FlexProps, Stack } from '@chakra-ui/react'

import { FormAuthType, FormColorTheme, FormLogoState } from '~shared/types'

import { useAdminForm } from '~features/admin-form/common/queries'
import { PREVIEW_MOCK_UINFIN } from '~features/admin-form/preview/constants'
import { useEnv } from '~features/env/queries'
import { EndPageBlock } from '~features/public-form/components/FormEndPage/components/EndPageBlock'
import { ThankYouSvgr } from '~features/public-form/components/FormEndPage/components/ThankYouSvgr'
import {
  FormBannerLogo,
  useFormBannerLogo,
} from '~features/public-form/components/FormLogo'
import { useBgColor } from '~features/public-form/components/PublicFormWrapper'

import {
  endPageDataSelector,
  useEndPageBuilderStore,
} from '../useEndPageBuilderStore'
import { useDesignColorTheme } from '../utils/useDesignColorTheme'

export const EndPageView = ({ ...props }: FlexProps): JSX.Element => {
  const { data: form, isLoading } = useAdminForm()
  const endPageFromStore = useEndPageBuilderStore(endPageDataSelector)

  // When drawer is opened, store is populated. We always want the drawer settings
  // to be previewed, so when the store is populated, prioritize that setting.
  const endPage = useMemo(
    () => (endPageFromStore ? endPageFromStore : form?.endPage),
    [endPageFromStore, form?.endPage],
  )
  const { data: { logoBucketUrl } = {} } = useEnv(
    form?.startPage.logo.state === FormLogoState.Custom,
  )

  const colorTheme = useDesignColorTheme()

  const formBannerLogoProps = useFormBannerLogo({
    logoBucketUrl,
    logo: form?.startPage.logo,
    agency: form?.admin.agency,
    colorTheme: form?.startPage.colorTheme,
    showDefaultLogoIfNoLogo: true,
  })

  const backgroundColor = useBgColor({ colorTheme })

  return (
    <Flex
      mb={0}
      flex={1}
      bg="neutral.200"
      // Using margin for margin collapse when there are inline messages above.
      mt={{ base: 0, md: '1rem' }}
      pt={{ base: 0, md: '1rem' }}
      pb={{ base: 0, md: '2rem' }}
      px={{ base: 0, md: '2rem' }}
      justify="center"
      overflow="auto"
      {...props}
    >
      <Stack w="100%" bg="white">
        <FormBannerLogo
          isLoading={isLoading}
          {...formBannerLogoProps}
          onLogout={undefined}
          loggedInId={
            form && form.authType !== FormAuthType.NIL
              ? PREVIEW_MOCK_UINFIN
              : undefined
          }
        />
        <Flex backgroundColor={backgroundColor} justifyContent="center">
          <ThankYouSvgr h="100%" pt="2.5rem" />
        </Flex>

        <Box
          py={{ base: '1.5rem', md: '3rem' }}
          px={{ base: '1.5rem', md: '4rem' }}
          w="100%"
        >
          <EndPageBlock
            formTitle={form?.title}
            endPage={endPage ?? { title: '', buttonText: '' }}
            submissionData={{
              id: form?._id ?? 'Submission ID',
              timeInEpochMs: Date.now(),
            }}
            colorTheme={colorTheme ?? FormColorTheme.Blue}
          />
        </Box>
      </Stack>
    </Flex>
  )
}
