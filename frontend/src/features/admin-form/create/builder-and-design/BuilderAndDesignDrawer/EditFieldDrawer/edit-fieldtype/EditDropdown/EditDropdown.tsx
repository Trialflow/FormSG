import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FormControl } from '@chakra-ui/react'
import { extend, pick } from 'lodash'

import { WorkflowType } from '~shared/types'
import { DropdownFieldBase } from '~shared/types/field'

import { createBaseValidationRules } from '~utils/fieldValidation'
import FormErrorMessage from '~components/FormControl/FormErrorMessage'
import FormLabel from '~components/FormControl/FormLabel'
import InlineMessage from '~components/InlineMessage'
import Input from '~components/Input'
import Textarea from '~components/Textarea'
import Toggle from '~components/Toggle'

import { useAdminFormWorkflow } from '../../../../../../create/workflow/hooks/useAdminFormWorkflow'
import { CreatePageDrawerContentContainer } from '../../../../../common'
import {
  SPLIT_TEXTAREA_TRANSFORM,
  SPLIT_TEXTAREA_VALIDATION,
} from '../common/constants'
import { FormFieldDrawerActions } from '../common/FormFieldDrawerActions'
import { EditFieldProps } from '../common/types'
import { useEditFieldForm } from '../common/useEditFieldForm'

type EditDropdownProps = EditFieldProps<DropdownFieldBase>

const EDIT_DROPDOWN_FIELD_KEYS = ['title', 'description', 'required'] as const

type EditDropdownKeys = (typeof EDIT_DROPDOWN_FIELD_KEYS)[number]

type EditDropdownInputs = Pick<DropdownFieldBase, EditDropdownKeys> & {
  fieldOptionsString: string // Differs from fieldOptions in DropdownFieldBase because input is a string. Will be converted to array using SPLIT_TEXTAREA_TRANSFORM
}

const transformDropdownFieldToEditForm = (
  field: DropdownFieldBase,
): EditDropdownInputs => {
  return {
    ...pick(field, EDIT_DROPDOWN_FIELD_KEYS),
    fieldOptionsString: SPLIT_TEXTAREA_TRANSFORM.input(field.fieldOptions),
  }
}

const transformDropdownEditFormToField = (
  inputs: EditDropdownInputs,
  originalField: DropdownFieldBase,
): DropdownFieldBase => {
  return extend({}, originalField, inputs, {
    fieldOptions: SPLIT_TEXTAREA_TRANSFORM.output(inputs.fieldOptionsString),
  })
}

export const EditDropdown = ({ field }: EditDropdownProps): JSX.Element => {
  const { t } = useTranslation()
  const { formWorkflow } = useAdminFormWorkflow()
  const {
    register,
    formState: { errors },
    buttonText,
    handleUpdateField,
    isLoading,
    handleCancel,
  } = useEditFieldForm<EditDropdownInputs, DropdownFieldBase>({
    field,
    transform: {
      input: transformDropdownFieldToEditForm,
      output: transformDropdownEditFormToField,
    },
    mode: 'onBlur',
  })

  const requiredValidationRule = useMemo(
    () => createBaseValidationRules({ required: true }),
    [],
  )

  const isFieldUsedForConditionalRouting = useMemo(() => {
    return formWorkflow?.some(
      (workflow) =>
        workflow.workflow_type === WorkflowType.Conditional &&
        workflow.conditional_field === field._id,
    )
  }, [formWorkflow, field._id])

  return (
    <CreatePageDrawerContentContainer>
      <FormControl isRequired isReadOnly={isLoading} isInvalid={!!errors.title}>
        <FormLabel>
          {t('features.adminForm.sidebar.fields.commonFieldComponents.title')}
        </FormLabel>
        <Input autoFocus {...register('title', requiredValidationRule)} />
        <FormErrorMessage>{errors?.title?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isReadOnly={isLoading} isInvalid={!!errors.description}>
        <FormLabel>
          {t(
            'features.adminForm.sidebar.fields.commonFieldComponents.description',
          )}
        </FormLabel>
        <Textarea {...register('description')} />
        <FormErrorMessage>{errors?.description?.message}</FormErrorMessage>
      </FormControl>
      <FormControl isReadOnly={isLoading}>
        <Toggle {...register('required')} label="Required" />
      </FormControl>
      <FormControl
        isRequired
        isReadOnly={isLoading}
        isInvalid={!!errors.fieldOptionsString}
      >
        <FormLabel>
          {t('features.adminForm.sidebar.fields.radio.options.title')}
        </FormLabel>
        <Textarea
          placeholder={t(
            'features.adminForm.sidebar.fields.radio.options.placeholder',
          )}
          {...register('fieldOptionsString', {
            validate: SPLIT_TEXTAREA_VALIDATION,
          })}
        />
        <FormErrorMessage>
          {errors?.fieldOptionsString?.message}
        </FormErrorMessage>
        {isFieldUsedForConditionalRouting ? (
          <InlineMessage mt="1rem" variant="warning">
            This field is linked to a step in your workflow. If you make any
            changes, ensure that the options and emails are updated in your CSV
            file.
          </InlineMessage>
        ) : null}
      </FormControl>
      <FormFieldDrawerActions
        isLoading={isLoading}
        buttonText={buttonText}
        handleClick={handleUpdateField}
        handleCancel={handleCancel}
      />
    </CreatePageDrawerContentContainer>
  )
}
