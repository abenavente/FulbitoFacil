class CanchitaController < ApplicationController
  # GET /canchita
  # GET /canchita.json
  def index
    @canchita = Canchitum.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @canchita }
    end
  end

  # GET /canchita/1
  # GET /canchita/1.json
  def show
    @canchitum = Canchitum.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @canchitum }
    end
  end

  # GET /canchita/new
  # GET /canchita/new.json
  def new
    @canchitum = Canchitum.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @canchitum }
    end
  end

  # GET /canchita/1/edit
  def edit
    @canchitum = Canchitum.find(params[:id])
  end

  # POST /canchita
  # POST /canchita.json
  def create
    @canchitum = Canchitum.create(params[:canchitum])

    respond_to do |format|
      if @canchitum.save
        format.html { redirect_to @canchitum, notice: 'Canchitum was successfully created.' }
        format.json { render json: @canchitum, status: :created, location: @canchitum }
      else
        format.html { render action: "new" }
        format.json { render json: @canchitum.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /canchita/1
  # PUT /canchita/1.json
  def update
    @canchitum = Canchitum.find(params[:id])

    respond_to do |format|
      if @canchitum.update_attributes(params[:canchitum])
        format.html { redirect_to @canchitum, notice: 'Canchitum was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @canchitum.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /canchita/1
  # DELETE /canchita/1.json
  def destroy
    @canchitum = Canchitum.find(params[:id])
    @canchitum.destroy

    respond_to do |format|
      format.html { redirect_to canchita_url }
      format.json { head :no_content }
    end
  end
end
