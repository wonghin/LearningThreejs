import { useControls } from "leva";

export function MyComponent() {
  const { name, aNumber } = useControls({ name: "World", aNumber: 0 });

  return (
    <div>
      Hey {name}, hello! {aNumber}
    </div>
  );
}
