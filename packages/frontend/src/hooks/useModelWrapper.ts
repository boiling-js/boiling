import { computed } from 'vue'

export default function useModelWrapper<
  Props extends Record<string, any>
>(props: Props, emit: any, name: keyof Props) {
  return computed({
    get: () => props[name],
    set: val => emit(`update:${ name }`, val)
  })
}
