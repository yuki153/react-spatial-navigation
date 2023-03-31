import { PublicComponentProps, useFocusable } from "../../lib";

type CellProps = {
    children: React.ReactNode;
} & PublicComponentProps;

const FocusableCell = (props: CellProps) => {
    const { children, ..._props } = props;
    const { ref, className } = useFocusable<HTMLTableCellElement>(_props);
    return (
        <td className={className} ref={ref}>{children}</td>
    )
}

const hiragana = ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'さ', 'し', 'す', 'せ', 'そ', 'た', 'ち', 'つ', 'て', 'と', 'な', 'に', 'ぬ', 'ね', 'の', 'は', 'ひ', 'ふ', 'へ', 'ほ', 'ま', 'み', 'む', 'め', 'も', 'や', '',  'ゆ', '',  'よ', 'ら', 'り', 'る', 'れ', 'ろ', 'わ', '',  '',  'を', 'ん'];
const rows = 5;


export const FocusableContents2 = () => {
    const { FocusProvider, ref } = useFocusable();
    return (
        <FocusProvider>
            <div className="content2" ref={ref}>
                <table>
                    <tbody>
                        {
                            [...new Array(hiragana.length / rows)].map((_, i) => (
                                <tr key={i}>
                                    {
                                        [...Array(rows)].map((_, j) => (
                                            <FocusableCell className="cell" key={j}>{hiragana[(i * rows) + j]}</FocusableCell>
                                        ))
                                    }
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </FocusProvider>
    )
}