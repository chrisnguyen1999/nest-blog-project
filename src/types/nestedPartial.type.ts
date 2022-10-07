export type NestedPartial<T> = {
    [P in keyof T]?: NestedPartial<T[P]>;
};

export type PartialExcept<T, K extends keyof T> = NestedPartial<T> & Pick<T, K>;
