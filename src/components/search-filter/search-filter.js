import * as React from "react";
import DialogTitle from "@material-ui/core/DialogTitle/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent/DialogContent";
import DialogActions from "@material-ui/core/DialogActions/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog/Dialog";
import NoteFilter from "../filter/filter";
import * as lodash from 'lodash';

class SearchFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filter: null,
      version: 0
    };
    this.closeFilter = this.closeFilter.bind(this);
    this.onFilterChanged = this.onFilterChanged.bind(this);
    this.reinit = this.reinit.bind(this);
  }

  reinit() {
    this.setState({filter: {source:null, tags: []}});
    this.props.onDone({});
  }
  onFilterChanged(event) {
    this.setState({filter: event});
  }

  closeFilter(save) {
    const filter = save ? this.state.filter : {};
    this.props.onDone(filter);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.props.open) {
      if (!prevProps.open) {
        this.setState({
          filter: lodash.cloneDeep(this.props.filter),
          version: this.state.version + 1
        });
      }
    } else if(prevProps.open) {
      this.setState({filter: null})
    }
  }

  render() {
    return (
      <Dialog open={this.props.open}
              onClose={() => this.closeFilter(false)}
              fullScreen={true}
              aria-labelledby="search-filter-dialog">
        <DialogTitle id="search-filter-dialog">Rechercher</DialogTitle>
        <DialogContent>
          <form onSubmit={this.handleSubmit} className="form">
            <NoteFilter filter={this.state.filter}
                        version={this.state.version}
                        onFilterChanged={this.onFilterChanged}
                        allowCreation={false}/>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => this.closeFilter(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={this.reinit} color="primary">
            Réinitialiser
          </Button>
          <Button onClick={() => this.closeFilter(true)} color="primary">
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}

export default SearchFilter;
